import React, { useState, useEffect } from 'react';
import * as ImagePicker from 'react-native-image-picker';
import RNQRGenerator from 'rn-qr-generator';
// import RNFS from 'react-native-fs';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  Linking,
  Alert,
  Share,
  BackHandler,
} from 'react-native';
import { RNCamera, BarCodeReadEvent } from 'react-native-camera';
import Clipboard from '@react-native-community/clipboard';

const App: React.FC = () => {
  const [scannedData, setScannedData] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);

  useEffect(() => {
    const backAction = () => {
      if (isScanning) {
        setIsScanning(false);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [isScanning]);

  const handleBarCodeScanned = ({ data }: BarCodeReadEvent) => {
    setScannedData(data || '');
    Vibration.vibrate();
    setIsScanning(false);
  };

  const showAlert = (data: string) => {
    Alert.alert('Error', data, [{ text: 'OK' }]);
  };

  const openLinkInBrowser = async () => {
    try {
      await Linking.openURL(scannedData);
    } catch (error) {
      showAlert('An error happened when trying to open the decoded data');
    }
  };

  const copyToClipboard = () => {
    Clipboard.setString(scannedData);
  };

  const shareData = async () => {
    try {
      await Share.share({
        message: scannedData,
      });
    } catch (error) {
      console.error('Error sharing data:', error.message);
    }
  };

  const resetScan = () => {
    setScannedData('');
    setIsScanning(true);
  };

  const renderCameraView = () => {
    return (
      <RNCamera
        style={styles.preview}
        type={RNCamera.Constants.Type.back}
        onBarCodeRead={handleBarCodeScanned}
        captureAudio={false}
      >
        <View style={styles.overlay}>
          <View style={styles.rectangle} />
        </View>
      </RNCamera>
    );
  };

  const handleScanQRCode = () => {
    setIsScanning(true);
  };
  

  const handleUploadQRCode = async (): Promise<void> => {
    ImagePicker.launchImageLibrary({ mediaType: 'photo' }, async (response) => {
      if (!response.didCancel && !response.error) {
        try {
          RNQRGenerator.detect({uri: response.assets[0].uri })
          .then(response => {
            const { values } = response; 
            Alert.alert(values[0]);
          })
          .catch(error => console.log('Cannot detect QR code in image', error));
          // console.log(arr);
          
          // const imageData = await RNFS.readFile(response.assets[0].uri, 'base64');
          // const decodedQR = decodeQRCode(imageData);
          // if (decodedQR) {
          //   setScannedData(decodedQR.data);
          //   Alert.alert('QR Code Scanned', `Data: ${result.data}`, [
          //     { text: 'OK' },
          //   ]);
          // } else {
          //   Alert.alert('QR Code not found in the image');
          // }
        } catch (error) {
          console.error('Error detecting QR code:', error);
          Alert.alert('Error detecting QR code');
        }
      }
    });
};
  const renderHomePage = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>QR Code Scanner</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleScanQRCode}>
            <Text style={styles.buttonText}>Scan QR Code</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleUploadQRCode}>
            <Text style={styles.buttonText}>Upload QR Code</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <>
      {isScanning ? (
        <View style={styles.container}>
          {renderCameraView()}
          <TouchableOpacity style={styles.cancelButton} onPress={() => setIsScanning(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : scannedData ? (
        <View style={styles.container}>
          <View style={styles.dataContainer}>
            <Text style={styles.dataText}>Scanned Data: {scannedData}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={openLinkInBrowser}>
                <Text style={styles.buttonText}>Open</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={copyToClipboard}>
                <Text style={styles.buttonText}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={shareData}>
                <Text style={styles.buttonText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={resetScan}>
                <Text style={styles.buttonText}>Scan Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        renderHomePage()
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: 'white',
    marginBottom: 30,
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  rectangle: {
    height: 300,
    width: 300,
    borderWidth: 2,
    borderColor: 'red',
    backgroundColor: 'transparent',
  },
  dataContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dataText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  button: {
    marginHorizontal: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#3498db',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  cancelButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 18,
  },
});

export default App;
