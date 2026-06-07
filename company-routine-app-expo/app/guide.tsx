// This screen is no longer used. Redirect to home if navigated directly.
import { Redirect } from 'expo-router';
export default function GuideRedirect() {
  return <Redirect href="/(tabs)" />;
}
