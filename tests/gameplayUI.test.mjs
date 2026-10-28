import test from 'node:test';
import assert from 'node:assert/strict';
import renderApp from './helpers/renderApp.cjs';
import fakeClock from './helpers/fakeClock.cjs';

function button(tree, label) {
  const match = tree.root.findAll((node) => node.type === 'TouchableOpacity' &&
    (node.props.accessibilityLabel === label || node.findAll((child) => child.type === 'Text' && child.props.children === label).length > 0))[0];
  assert.ok(match, `Missing button: ${label}`);
  return match;
}

test('every advertised arithmetic topic/mode renders and completes a ten-question round', async () => {
  const clock = fakeClock();
  const app = renderApp(clock);
  const { GameScreen } = app.load('src/screens/GameScreen.tsx');
  const { TopicConfig } = app.load('src/constants/game.ts');
  const { resolveGameConfiguration } = app.load('src/domain/gameConfiguration.ts');
  const { useGameSessionStore: store } = app.load('src/store/gameSessionStore.ts');
  const { useAdditionProgressStore: progress } = app.load('src/store/additionProgressStore.ts');
  for (const [topicId, { modes }] of Object.entries(TopicConfig)) {
    if (topicId === 'games') continue;
    for (const modeId of modes) {
      app.context.route = { params: { topicId, modeId } };
      const config = resolveGameConfiguration(topicId, modeId);
      const completedBefore = app.calls.filter(([action, screen]) => action === 'replace' && screen === 'Result').length;
      let tree;
      await app.act(async () => { tree = app.renderer.create(app.React.createElement(GameScreen)); });
      assert.equal(JSON.stringify(tree.toJSON()).includes('UNKNOWN'), false, `${topicId}/${modeId}`);
      for (let index = 1; index <= 10; index++) {
        assert.equal(store.getState().questionIndex, index, `${topicId}/${modeId}`);
        const q = store.getState().currentQuestion;
        if (config.view === 'learn') {
          await app.act(async () => button(tree, 'Show explanation').props.onPress());
          assert.ok(JSON.stringify(tree.toJSON()).includes(q.explanation.replaceAll('\n', '\\n')) || tree.root.findAll((node) => node.type === 'Text' && node.props.children === q.explanation).length);
          await app.act(async () => button(tree, index === 10 ? 'Complete lesson' : 'Got it. Next question').props.onPress());
        } else if (config.view === 'play') {
          await app.act(async () => tree.root.findByProps({ accessibilityLabel: 'Your answer' }).props.onChangeText(q.display.options[q.correctOptionIndex]));
          await app.act(async () => button(tree, 'Check answer').props.onPress());
        } else if (config.view === 'duel') {
          await app.act(async () => button(tree, `bottom answer ${q.bottom.options[q.bottom.correctOptionIndex]}`).props.onPress());
        } else {
          await app.act(async () => button(tree, q.display.options[q.correctOptionIndex]).props.onPress());
        }
        if (config.view !== 'time') await app.act(async () => clock.advance(900));
      }
      const results = app.calls.filter(([action, screen]) => action === 'replace' && screen === 'Result');
      assert.equal(results.length, completedBefore + 1, `${topicId}/${modeId}`);
      const score = results.at(-1)[2].score;
      assert.equal(score.questionHistory.length, 10);
      assert.equal(score.greenChip, config.view === 'duel' ? 0 : 10);
      assert.equal(store.getState().isActive, false);
      assert.equal(progress.getState().getTier(`${topicId}:${modeId}:game1`).completed, true);
      await app.act(async () => tree.unmount());
      assert.equal(clock.pending(), 0);
    }
  }
});

test('rendered wrong-wrong-correct retries stay enabled, count once, and reset for a new question', async () => {
  for (const modeId of ['practice', 'quiz', 'test', 'time']) {
    const clock = fakeClock();
    const app = renderApp(clock);
    app.context.route.params = { topicId: 'subtraction', modeId };
    const { GameScreen } = app.load('src/screens/GameScreen.tsx');
    const { useGameSessionStore: store } = app.load('src/store/gameSessionStore.ts');
    let tree;
    await app.act(async () => { tree = app.renderer.create(app.React.createElement(GameScreen)); });
    const q = store.getState().currentQuestion;
    const incorrect = q.display.options.find((_, index) => index !== q.correctOptionIndex);
    await app.act(async () => { button(tree, incorrect).props.onPress(); button(tree, incorrect).props.onPress(); });
    assert.equal(store.getState().questionIndex, 1);
    assert.equal(button(tree, q.display.options[q.correctOptionIndex]).props.disabled, false);
    await app.act(async () => {
      const correct = button(tree, q.display.options[q.correctOptionIndex]);
      correct.props.onPress(); correct.props.onPress();
    });
    if (modeId !== 'time') await app.act(async () => clock.advance(900));
    assert.equal(store.getState().questionIndex, 2);
    assert.equal(store.getState().redChip, 1);
    assert.equal(store.getState().greenChip, 0);
    assert.equal(store.getState().questionHistory.length, 1);
    const next = store.getState().currentQuestion;
    assert.equal(button(tree, next.display.options[next.correctOptionIndex]).props.disabled, false);
    await app.act(async () => tree.unmount());
  }
});

test('Exam wrong answers resolve once, advance, and count as wrong in results', async () => {
  const clock = fakeClock();
  const app = renderApp(clock);
  app.context.route.params = { topicId: 'division', modeId: 'exam' };
  const { GameScreen } = app.load('src/screens/GameScreen.tsx');
  const { useGameSessionStore: store } = app.load('src/store/gameSessionStore.ts');
  let tree;
  await app.act(async () => { tree = app.renderer.create(app.React.createElement(GameScreen)); });
  for (let i = 1; i <= 10; i++) {
    const q = store.getState().currentQuestion;
    const wrongLabel = q.display.options[(q.correctOptionIndex + 1) % 4];
    await app.act(async () => { const wrong = button(tree, wrongLabel); wrong.props.onPress(); wrong.props.onPress(); });
    assert.equal(store.getState().redChip, i);
    await app.act(async () => clock.advance(900));
  }
  const score = app.calls.find(([action, name]) => action === 'replace' && name === 'Result')[2].score;
  assert.equal(score.redChip, 10);
  assert.ok(score.questionHistory.every((row) => !row.correct));
  await app.act(async () => tree.unmount());
});

test('Time expires through the rendered screen and navigates only once', async () => {
  const clock = fakeClock();
  const app = renderApp(clock);
  app.context.route.params = { topicId: 'division', modeId: 'time' };
  const { GameScreen } = app.load('src/screens/GameScreen.tsx');
  const { useGameSessionStore: store } = app.load('src/store/gameSessionStore.ts');
  let tree;
  await app.act(async () => { tree = app.renderer.create(app.React.createElement(GameScreen)); });
  await app.act(async () => clock.advance(45000));
  assert.equal(store.getState().redChip, 10);
  assert.equal(app.calls.filter(([action, name]) => action === 'replace' && name === 'Result').length, 1);
  assert.equal(clock.pending(), 0);
  await app.act(async () => tree.unmount());
});

test('typed Play rejects invalid input, accepts an equivalent fraction, and clears next input', async () => {
  const clock = fakeClock();
  const app = renderApp(clock);
  app.context.route.params = { topicId: 'fraction', modeId: 'play' };
  const { GameScreen } = app.load('src/screens/GameScreen.tsx');
  const { useGameSessionStore: store } = app.load('src/store/gameSessionStore.ts');
  let tree;
  await app.act(async () => { tree = app.renderer.create(app.React.createElement(GameScreen)); });
  await app.act(async () => button(tree, 'Check answer').props.onPress());
  assert.equal(store.getState().hadWrongAttempt, false);
  await app.act(async () => { button(tree, '1').props.onPress(); button(tree, '/').props.onPress(); button(tree, '0').props.onPress(); });
  await app.act(async () => button(tree, 'Check answer').props.onPress());
  assert.equal(store.getState().hadWrongAttempt, false);
  const q = store.getState().currentQuestion;
  const [n, d = '1'] = q.display.answer.split('/');
  await app.act(async () => tree.root.findByProps({ accessibilityLabel: 'Your answer' }).props.onChangeText(`${Number(n) * 2}/${Number(d) * 2}`));
  await app.act(async () => button(tree, 'Check answer').props.onPress());
  await app.act(async () => clock.advance(900));
  assert.equal(store.getState().greenChip, 1);
  assert.equal(tree.root.findByProps({ accessibilityLabel: 'Your answer' }).props.value, '');
  await app.act(async () => tree.unmount());
});

test('invalid game route shows a way back and never starts an addition fallback', async () => {
  const app = renderApp(fakeClock());
  app.context.route.params = { topicId: 'unknown', modeId: 'practice' };
  const { GameScreen } = app.load('src/screens/GameScreen.tsx');
  const { useGameSessionStore: store } = app.load('src/store/gameSessionStore.ts');
  let tree;
  await app.act(async () => { tree = app.renderer.create(app.React.createElement(GameScreen)); });
  assert.equal(store.getState().isActive, false);
  await app.act(async () => button(tree, 'Go back').props.onPress());
  assert.deepEqual(app.calls.at(-1), ['goBack']);
  await app.act(async () => tree.unmount());
});
