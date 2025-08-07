import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Erreur', 'Veuillez entrer votre email.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://your-app-url.com/auth/callback', // Update with your app's URL
    });
    setLoading(false);
    if (error) {
      Alert.alert('Erreur', error.message || 'Impossible d\'envoyer l\'email.');
    } else {
      Alert.alert('Succès', 'Un email de réinitialisation a été envoyé.');
      router.replace('/auth/sign-in');
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-gray-50">
      <Text className="text-2xl font-bold mb-8 text-center">Mot de passe oublié</Text>
      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 mb-6 bg-white"
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TouchableOpacity
        className="bg-primary-600 rounded-lg py-3 mb-3"
        onPress={handleForgotPassword}
        disabled={loading}
      >
        <Text className="text-white text-center text-lg font-semibold">
          {loading ? 'Envoi...' : 'Envoyer le lien'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity className="mt-8" onPress={() => router.replace('/auth/sign-in')}>
        <Text className="text-center text-gray-500">
          Retour à la <Text className="text-primary-600 font-semibold">connexion</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}