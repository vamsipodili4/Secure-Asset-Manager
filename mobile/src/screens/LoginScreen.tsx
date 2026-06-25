import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Shield, Fingerprint, Lock, ShieldCheck, Mail, Key, LogIn } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const { signIn } = useAuth();

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      setIsBiometricAvailable(compatible && types.length > 0);
    })();
  }, []);

  const handleNormalLogin = async () => {
    if (!email || !password) {
      Alert.alert('Protocol Error', 'Access denied. Please provide full credentials.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      await signIn(token, user);
      navigation.navigate('Dashboard');
    } catch (error: any) {
      Alert.alert('Authentication Failed', error.response?.data?.message || 'Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    Alert.alert('Protocol Redirect', 'Initializing Google Secure Handshake...');
    // Implementation would require expo-auth-session
    // Placeholder for actual redirect
  };

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authorize S.A.M Vault Entry',
        fallbackLabel: 'Use Command Code',
      });

      if (result.success) {
        navigation.navigate('Dashboard');
      }
    } catch (error) {
      Alert.alert('Security Breach', 'Biometric validation failed.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <LinearGradient
          colors={['#020617', '#0f172a', '#020617']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <View style={styles.logoGlow} />
              <View style={styles.logo}>
                <ShieldCheck size={44} color="#fff" strokeWidth={2.5} />
              </View>
              <Text style={styles.title}>S.A.M</Text>
              <Text style={styles.subtitle}>SECURE ASSET MANAGER</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputWrapper}>
                <Mail size={18} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="AGENT EMAIL"
                  placeholderTextColor="#475569"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Key size={18} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="COMMAND PASSCODE"
                  placeholderTextColor="#475569"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity 
                style={[styles.primaryButton, loading && { opacity: 0.7 }]}
                onPress={handleNormalLogin}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#020617" /> : (
                  <>
                    <LogIn size={20} color="#020617" />
                    <Text style={styles.buttonText}>Authenticate User</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.googleButton}
                onPress={handleGoogleLogin}
              >
                <Text style={styles.googleButtonText}>Continue with Google Secure ID</Text>
              </TouchableOpacity>

              {isBiometricAvailable && (
                <TouchableOpacity 
                  style={styles.biometricButton}
                  onPress={handleBiometricAuth}
                >
                  <Fingerprint size={24} color="#0ea5e9" />
                  <Text style={styles.biometricText}>Quick Access via Biometrics</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.footer}>
              <Lock size={12} color="#475569" style={{ marginBottom: 4 }} />
              <Text style={styles.footerText}>
                AES-256 ZERO-KNOWLEDGE PROTOCOL ACTIVE
              </Text>
            </View>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoGlow: {
     position: 'absolute',
     width: 100,
     height: 100,
     backgroundColor: '#0284c7',
     borderRadius: 50,
     opacity: 0.2,
     top: -10,
  },
  logo: {
    width: 80,
    height: 80,
    backgroundColor: '#0284c7',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 6,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 6,
    fontWeight: '700',
    letterSpacing: 3,
  },
  formContainer: {
    width: '100%',
    gap: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    height: 60,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#fff',
    flexDirection: 'row',
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  buttonText: {
    color: '#020617',
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  googleButton: {
    width: '100%',
    backgroundColor: 'transparent',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  googleButtonText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 12,
  },
  biometricText: {
    color: '#0ea5e9',
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    color: '#334155',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 2,
  },
});

export default LoginScreen;
