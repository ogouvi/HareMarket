import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, signIn, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }
    const { user, error } = await signUp(email, password, name);
    if (error) {
      Alert.alert('Erreur', error.message || 'Impossible de créer le compte.');
    } else if (user) {
      // Automatically sign in after sign up
      const { user: signedInUser, error: signInError } = await signIn(email, password);
      if (signInError) {
        Alert.alert('Erreur', signInError.message || 'Impossible de se connecter après inscription.');
      } else if (signedInUser) {
        router.replace('/(tabs)');
      }
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-gray-50">
      <Text className="text-2xl font-bold mb-8 text-center">Créer un compte</Text>
      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4 bg-white"
        placeholder="Nom complet"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4 bg-white"
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4 bg-white"
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 mb-6 bg-white"
        placeholder="Confirmer le mot de passe"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <TouchableOpacity
        className="bg-primary-600 rounded-lg py-3 mb-3"
        onPress={handleSignUp}
        disabled={loading}
      >
        <Text className="text-white text-center text-lg font-semibold">
          {loading ? 'Création...' : 'Créer un compte'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity className="mt-8" onPress={() => router.replace('/auth/sign-in')}>
        <Text className="text-center text-gray-500">
          Déjà un compte ? <Text className="text-primary-600 font-semibold">Se connecter</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}