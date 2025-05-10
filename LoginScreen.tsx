// LoginScreen.tsx
import React from 'react';
import { View, Button, Text } from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
/**
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID_FROM_FIREBASE', // Don't use the iOS client ID
});**/


GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID', // from Firebase
});

export default function LoginScreen({ navigation }: any) {
  const loginWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = (await GoogleSignin.getTokens()).idToken;
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);
      navigation.replace('Todos');
    } catch (error) {
      console.log('Login Error,Something went wrong');
    }
  
  };

  return (
    <View>
      <Text>Welcome to the To-Do App</Text>
      <Button title="Login with Google" onPress={loginWithGoogle} />
    </View>
  );
}
