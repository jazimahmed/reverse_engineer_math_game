import test from 'node:test';
import assert from 'node:assert/strict';
import renderApp from './helpers/renderApp.cjs';

const tap = (tree, label) => tree.root.findAll((node) => node.type === 'TouchableOpacity' && node.props.accessibilityLabel === label)[0];

test('child-friendly cards keep every topic and mode navigable in both themes', async () => {
  const app = renderApp();
  const { MainMenuScreen } = app.load('src/screens/MainMenuScreen.tsx');
  const { TopicSelectScreen } = app.load('src/screens/TopicSelectScreen.tsx');
  const { TopicConfig } = app.load('src/constants/game.ts');
  const { ModePresentation } = app.load('src/constants/topicPresentation.ts');
  const { useSettingsStore: settings } = app.load('src/store/settingsStore.ts');
  let tree;
  for (const night of [false, true]) {
    await app.act(async () => {
      settings.getState().setNight(night);
      tree = app.renderer.create(app.React.createElement(MainMenuScreen));
    });
    for (const [topicId, config] of Object.entries(TopicConfig)) {
      await app.act(async () => tap(tree, config.title).props.onPress());
      assert.deepEqual(app.calls.at(-1), topicId === 'games' ? ['navigate', 'GamesHub'] : ['navigate', 'TopicSelect', { topicId }]);
    }
    const start = tree.root.findAll((node) => node.type === 'TouchableOpacity' && node.findAll((child) => child.type === 'Text' && child.props.children === 'Start here: Addition →').length)[0];
    await app.act(async () => start.props.onPress());
    assert.deepEqual(app.calls.at(-1), ['navigate', 'TopicSelect', { topicId: 'addition' }]);
    for (const [topicId, config] of Object.entries(TopicConfig)) {
      if (topicId === 'games') continue;
      app.context.route.params = { topicId };
      await app.act(async () => tree.update(app.React.createElement(TopicSelectScreen)));
      for (const modeId of config.modes) {
        await app.act(async () => tap(tree, ModePresentation[modeId].label).props.onPress());
        assert.deepEqual(app.calls.at(-1), ['navigate', 'Game', { modeId, topicId }]);
      }
      await app.act(async () => tap(tree, 'Go back').props.onPress());
      assert.deepEqual(app.calls.at(-1), ['goBack']);
    }
    await app.act(async () => tree.unmount());
  }
});
