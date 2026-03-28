/**
 * Expo Router does not publicly export the hook used by `expo-router/ui` tab navigators
 * to read `{ state, descriptors, navigation }`. `SwipeableTabSlot` needs it to stay in
 * sync with `TabTrigger` / `TabActions.jumpTo`.
 *
 * This file re-exports the internal API from a single place. After upgrading `expo-router`,
 * if TypeScript or runtime breaks here, check whether the path or export changed in that release.
 */
export { useNavigatorContext } from "expo-router/build/views/Navigator";
