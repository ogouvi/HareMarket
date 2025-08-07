import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    const { user, error } = await signIn(email, password);
    if (error) {
      Alert.alert('Erreur', error.message || 'Impossible de se connecter.');
    } else if (user) {
      router.replace('/(tabs)');
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-gray-50">
      <Text className="text-2xl font-bold mb-8 text-center">Connexion</Text>
      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4 bg-white"
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 mb-6 bg-white"
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity
        className="bg-primary-600 rounded-lg py-3 mb-3"
        onPress={handleSignIn}
        disabled={loading}
      >
        <Text className="text-white text-center text-lg font-semibold">
          {loading ? 'Connexion...' : 'Se connecter'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity className="mt-8" onPress={() => router.push('/auth/sign-up')}>
        <Text className="text-center text-gray-500">
          Pas de compte ? <Text className="text-primary-600 font-semibold">Créer un compte</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}