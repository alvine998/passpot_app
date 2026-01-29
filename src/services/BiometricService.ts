import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics();

export const BiometricService = {
  checkBiometrics: async (): Promise<boolean> => {
    try {
      const { available } = await rnBiometrics.isSensorAvailable();
      return available;
    } catch (error) {
      console.error('Biometric sensor error:', error);
      return false;
    }
  },

  authenticate: async (
    promptMessage: string = 'Confirm biometric to continue',
  ): Promise<boolean> => {
    try {
      const { available, biometryType } =
        await rnBiometrics.isSensorAvailable();

      if (!available) {
        return false;
      }

      const result = await rnBiometrics.simplePrompt({
        promptMessage,
      });

      return result.success;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  },

  getBiometryType: async (): Promise<string | null> => {
    try {
      const { available, biometryType } =
        await rnBiometrics.isSensorAvailable();
      if (!available) return null;

      if (biometryType === BiometryTypes.FaceID) return 'FaceID';
      if (biometryType === BiometryTypes.TouchID) return 'TouchID';
      if (biometryType === BiometryTypes.Biometrics) return 'Fingerprint';

      return 'Biometrics';
    } catch (error) {
      return null;
    }
  },
};
