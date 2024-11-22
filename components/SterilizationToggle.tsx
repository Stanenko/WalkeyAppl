import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const SterilizationToggle = ({ isSterilized, setIsSterilized, gender, isInHeat, setIsInHeat }) => {
  return (
    <View>
   
      <View style={styles.row}>
        <Text style={styles.label}>Кастрація / стерилізація</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              isSterilized ? styles.activeButton : styles.inactiveButton,
            ]}
            onPress={() => setIsSterilized(true)}
          >
            <Text style={[styles.toggleText, isSterilized ? styles.activeText : styles.inactiveText]}>
              Так
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              !isSterilized ? styles.activeButton : styles.inactiveButton,
            ]}
            onPress={() => setIsSterilized(false)}
          >
            <Text style={[styles.toggleText, !isSterilized ? styles.activeText : styles.inactiveText]}>
              Ні
            </Text>
          </TouchableOpacity>
        </View>
      </View>

     
      {gender === 'female' && (
        <View style={styles.row}>
          <Text style={styles.label}>Течка зараз</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                isInHeat ? styles.activeButton : styles.inactiveButton,
              ]}
              onPress={() => setIsInHeat(true)}
            >
              <Text style={[styles.toggleText, isInHeat ? styles.activeText : styles.inactiveText]}>
                Так
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                !isInHeat ? styles.activeButton : styles.inactiveButton,
              ]}
              onPress={() => setIsInHeat(false)}
            >
              <Text style={[styles.toggleText, !isInHeat ? styles.activeText : styles.inactiveText]}>
                Ні
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default SterilizationToggle;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10, 
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
    width: 182, 
    height: 38, 
  },
  toggleButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#FF6C22',
  },
  inactiveButton: {
    backgroundColor: '#f9f9f9', 
  },
  toggleText: {
    fontWeight: '500',
  },
  activeText: {
    color: '#fff', 
  },
  inactiveText: {
    color: '#aaa', 
  },
});
