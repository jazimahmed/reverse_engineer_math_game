import test from 'node:test';
import assert from 'node:assert/strict';
import renderApp from './helpers/renderApp.cjs';

const button = (tree, label) => tree.root.findAll((node) => node.type === 'TouchableOpacity' &&
  (node.props.accessibilityLabel === label || node.findAll((child) => child.type === 'Text' && child.props.children === label).length > 0))[0];

test('settings switches persist, reset keeps profile, and Done closes without touch interception', async () => {
  const app = renderApp();
  const { SettingsPanel } = app.load('src/components/SettingsPanel.tsx');
  const { useSettingsStore: store } = app.load('src/store/settingsStore.ts');
  let closed = 0;
  let tree;
  await app.act(async () => { tree = app.renderer.create(app.React.createElement(SettingsPanel, { onClose: () => closed++ })); });
  await app.act(async () => {
    tree.root.findByProps({ accessibilityLabel: 'Dark appearance' }).props.onValueChange(true);
    tree.root.findByProps({ accessibilityLabel: 'Answer vibration' }).props.onValueChange(false);
    store.getState().setProfileName('  Ada  ');
  });
  assert.equal(closed, 0);
  assert.equal(store.getState().night, true);
  assert.equal(store.getState().haptics, false);
  assert.equal(store.getState().profileName, 'Ada');
  const saved = JSON.parse(app.storage.get('mg_settings_v1')).state;
  assert.equal(saved.night, true);
  assert.equal(saved.haptics, false);
  await app.act(async () => { store.setState({ night: false, haptics: true, profileName: 'Temporary' });
    app.storage.set('mg_settings_v1', JSON.stringify({ state: saved, version: 1 }));
    await store.persist.rehydrate(); });
  assert.equal(store.getState().profileName, 'Ada');
  assert.equal(store.getState().night, true);
  await app.act(async () => button(tree, 'Restore default preferences').props.onPress());
  assert.equal(store.getState().night, false);
  assert.equal(store.getState().haptics, true);
  assert.equal(store.getState().profileName, 'Ada');
  await app.act(async () => button(tree, 'Done').props.onPress());
  assert.equal(closed, 1);
  await app.act(async () => tree.unmount());
});

test('saved progress resets only after confirmation and leaves preferences/profile intact', async () => {
  const app = renderApp();
  const { SettingsPanel } = app.load('src/components/SettingsPanel.tsx');
  const { useAdditionProgressStore: addition } = app.load('src/store/additionProgressStore.ts');
  const { useEquationsProgressStore: equations } = app.load('src/store/equationsProgressStore.ts');
  let tree;
  await app.act(async () => { tree = app.renderer.create(app.React.createElement(SettingsPanel, { onClose() {} })); });
  addition.getState().updateTier('practice', { bestScore: 8 });
  equations.getState().unlockLevel(2);
  await app.act(async () => button(tree, 'Reset saved progress').props.onPress());
  const actions = app.alerts[0][2];
  assert.equal(actions[0].style, 'cancel');
  assert.equal(addition.getState().getTier('practice').bestScore, 8);
  assert.equal(equations.getState().getLevel(2).unlocked, true);
  await app.act(async () => actions[1].onPress());
  assert.deepEqual(addition.getState().tiers, {});
  assert.equal(equations.getState().getLevel(2).unlocked, false);
  await app.act(async () => tree.unmount());
});

test('profile edit saves normalized local name and home actions navigate to real screens', async () => {
  const app = renderApp();
  const { ProfileScreen } = app.load('src/screens/ProfileScreen.tsx');
  const { useSettingsStore: store } = app.load('src/store/settingsStore.ts');
  let tree;
  await app.act(async () => { tree = app.renderer.create(app.React.createElement(ProfileScreen)); });
  await app.act(async () => tree.root.findByProps({ accessibilityLabel: 'Profile name' }).props.onChangeText('  Grace  '));
  await app.act(async () => button(tree, 'Save profile').props.onPress());
  assert.equal(store.getState().profileName, 'Grace');
  assert.deepEqual(app.calls.at(-1), ['goBack']);
  const { MainMenuScreen } = app.load('src/screens/MainMenuScreen.tsx');
  await app.act(async () => { tree.update(app.React.createElement(MainMenuScreen)); });
  await app.act(async () => button(tree, 'Edit profile').props.onPress());
  assert.deepEqual(app.calls.at(-1), ['navigate', 'Profile']);
  await app.act(async () => button(tree, 'Settings').props.onPress());
  assert.deepEqual(app.calls.at(-1), ['navigate', 'Settings']);
  assert.equal(JSON.stringify(tree.toJSON()).includes('文/A'), false);
  await app.act(async () => tree.unmount());
});

test('in-game settings pauses the same round, stays paused across AppState, and Done resumes it', async () => {
  const app = renderApp();
  const { GameScreen } = app.load('src/screens/GameScreen.tsx');
  const { useGameSessionStore: store } = app.load('src/store/gameSessionStore.ts');
  let tree;
  await app.act(async () => { tree = app.renderer.create(app.React.createElement(GameScreen)); });
  const { sessionId, currentQuestion } = store.getState();
  await app.act(async () => button(tree, 'Game settings').props.onPress());
  assert.equal(store.getState().isPaused, true);
  await app.act(async () => { app.appState('background'); app.appState('active'); });
  assert.equal(store.getState().isPaused, true);
  await app.act(async () => button(tree, 'Done').props.onPress());
  assert.equal(store.getState().isPaused, false);
  assert.equal(store.getState().sessionId, sessionId);
  assert.equal(store.getState().currentQuestion, currentQuestion);
  await app.act(async () => button(tree, 'Game settings').props.onPress());
  const modal = tree.root.findAll((node) => typeof node.type === 'function' && node.type.name === 'Modal')[0];
  await app.act(async () => modal.props.onRequestClose());
  assert.equal(store.getState().isPaused, false);
  await app.act(async () => tree.unmount());
  assert.equal(store.getState().isActive, false);
});

test('correct-answer vibration follows preference and duplicate taps do not vibrate twice', async () => {
  for (const enabled of [true, false]) {
    const app = renderApp();
    const { GameScreen } = app.load('src/screens/GameScreen.tsx');
    const { useGameSessionStore: store } = app.load('src/store/gameSessionStore.ts');
    const { useSettingsStore: settings } = app.load('src/store/settingsStore.ts');
    let tree;
    await app.act(async () => { tree = app.renderer.create(app.React.createElement(GameScreen)); });
    await app.act(async () => settings.getState().setHaptics(enabled));
    const q = store.getState().currentQuestion;
    const answer = button(tree, String(q.options[q.correctOptionIndex]));
    await app.act(async () => { answer.props.onPress(); answer.props.onPress(); });
    assert.equal(app.calls.filter(([name]) => name === 'vibrate').length, enabled ? 1 : 0);
    await app.act(async () => tree.unmount());
  }
});
