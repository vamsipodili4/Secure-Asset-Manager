import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { FileText, Image as ImageIcon, Video, File, Upload, Share2, LogOut, Shield } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const DashboardScreen = ({ navigation }: any) => {
  const { user, signOut } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/assets/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigation.navigate('Login');
  };

  const stats = [
    { title: 'Assets', value: loading ? '...' : analytics?.totalAssets || '0', color: '#0ea5e9' },
    { title: 'Storage', value: loading ? '...' : `${(analytics?.totalStorage / (1024 * 1024)).toFixed(1)}MB`, color: '#10b981' },
    { title: 'Integrity', value: loading ? '...' : `${analytics?.healthScore || '100'}%`, color: '#8b5cf6' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>WELCOME, AGENT</Text>
          <Text style={styles.userName}>{user?.name?.toUpperCase() || 'UNKNOWN'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <LogOut size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <Text style={styles.statLabel}>{stat.title}</Text>
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Secure Archives</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>ACCESS VAULT</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
         <Shield size={16} color="#0ea5e9" />
         <Text style={styles.infoText}>Quantum-resistant encryption active on all packets.</Text>
      </View>

      <TouchableOpacity style={styles.fab}>
        <Upload size={24} color="#fff" />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 10,
  },
  welcomeText: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
  },
  logoutBtn: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 15,
    width: '31%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  seeAll: {
    color: '#0ea5e9',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  infoBox: {
    backgroundColor: 'rgba(14, 165, 233, 0.05)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 0,
    width: 64,
    height: 64,
    backgroundColor: '#0284c7',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
});

export default DashboardScreen;
