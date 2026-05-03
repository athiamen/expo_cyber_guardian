import { useLocalSearchParams } from 'expo-router';
import { EditProfileScreen } from '../features/profile/screens/EditProfileScreen';

export default function EditProfileRoute() {
  const params = useLocalSearchParams<{ token?: string }>();

  if (!params.token) {
    return null;
  }

  return <EditProfileScreen token={params.token} />;
}
