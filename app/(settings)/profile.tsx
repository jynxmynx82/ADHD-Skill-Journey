
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
  Modal,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { User, Lock, LogOut, Trash2, ArrowLeft, X } from 'lucide-react-native';
import { WebGradientWrapper } from '@/components/WebGradientWrapper';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, signOut, deleteAccount } = useAuth();
  const [username, setUsername] = useState(user?.displayName || '');
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSaveUsername = async () => {
    try {
      // TODO: Implement username update in Firebase
      setIsEditing(false);
      Alert.alert('Success', 'Username updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update username');
    }
  };

  const handleLogoutPress = () => {
    if (Platform.OS === 'web') {
      setShowLogoutModal(true);
    } else {
      Alert.alert(
        'Log Out',
        'Are you sure you want to log out?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Log Out',
            style: 'destructive',
            onPress: handleLogout
          }
        ]
      );
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/(auth)');
    } catch (error) {
      Alert.alert('Error', 'Failed to log out');
    }
  };

  const handleDeleteAccount = () => {
    if (Platform.OS === 'web') {
      setShowDeleteModal(true);
    } else {
      Alert.alert(
        'Delete Account',
        'Are you sure you want to delete your account? This action cannot be undone.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteAccount();
                router.replace('/(auth)');
              } catch (error) {
                Alert.alert('Error', 'Failed to delete account. Please try again later.');
              }
            },
          },
        ]
      );
    }
  };

  const handleChangePassword = () => {
    router.push('/(settings)/password' as any);
  };

  const LogoutConfirmationModal = () => (
    <Modal
      visible={showLogoutModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowLogoutModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Log Out</Text>
            <TouchableOpacity onPress={() => setShowLogoutModal(false)}>
              <X color={colors.text} size={24} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.modalText, { color: colors.text }]}>
            Are you sure you want to log out?
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { borderColor: colors.border }]}
              onPress={() => setShowLogoutModal(false)}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonDestructive]}
              onPress={() => {
                setShowLogoutModal(false);
                handleLogout();
              }}
            >
              <Text style={[styles.modalButtonText, { color: '#fff' }]}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const DeleteAccountModal = () => (
    <Modal
      visible={showDeleteModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowDeleteModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Delete Account</Text>
            <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
              <X color={colors.text} size={24} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.modalText, { color: colors.text }]}>
            Are you sure you want to delete your account? This action cannot be undone.
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { borderColor: colors.border }]}
              onPress={() => setShowDeleteModal(false)}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonDestructive]}
              onPress={async () => {
                setShowDeleteModal(false);
                try {
                  await deleteAccount();
                  router.replace('/(auth)');
                } catch (error) {
                  Alert.alert('Error', 'Failed to delete account. Please try again later.');
                }
              }}
            >
              <Text style={[styles.modalButtonText, { color: '#fff' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <WebGradientWrapper>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <ArrowLeft color={colors.text} size={24} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Profile Settings</Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {/* Profile Section */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <User size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile Information</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Username</Text>
              {isEditing ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Enter username"
                    placeholderTextColor={colors.textSecondary}
                  />
                  <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: colors.primary }]}
                    onPress={handleSaveUsername}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.displayContainer}>
                  <Text style={[styles.username, { color: colors.text }]}>{username}</Text>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setIsEditing(true)}
                  >
                    <Text style={[styles.editButtonText, { color: colors.primary }]}>Edit</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Account Actions Section */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Lock size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Actions</Text>
            </View>

            <TouchableOpacity
              style={[styles.actionButton, { borderColor: colors.border }]}
              onPress={handleChangePassword}
            >
              <Text style={[styles.actionButtonText, { color: colors.text }]}>Change Password</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { borderColor: colors.border }]}
              onPress={handleLogoutPress}
            >
              <LogOut size={20} color={colors.error} />
              <Text style={[styles.actionButtonText, { color: colors.error }]}>Log Out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { borderColor: colors.error }]}
              onPress={handleDeleteAccount}
            >
              <Trash2 size={20} color={colors.error} />
              <Text style={[styles.actionButtonText, { color: colors.error }]}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        {Platform.OS === 'web' && (
          <>
            <LogoutConfirmationModal />
            <DeleteAccountModal />
          </>
        )}
      </SafeAreaView>
    </WebGradientWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
      default: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  displayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  username: {
    fontSize: 16,
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    ...(Platform.OS === 'web' && {
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  modalButtonDestructive: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 