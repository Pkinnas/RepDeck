import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, Text, View } from 'react-native';


// Convert Time (seconds in minutes)
const fmt = (s) =>
          `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;


export default function Index() {

  const [total, setTotal] = useState(30 * 60);
  const [running, setRunning] = useState(true);

  // Effect
  useEffect(() => {

    // If the timer is paused, do nothing
    if (!running) return;
    
    const id = setInterval(() => {
      // Decreases the time by 1 sec
      setTotal((t) => t - 1);
    }, 1000);

    // Cleanup: stop the timer when the effect re-runs or the screen closes
    return () => clearInterval(id);

  // Re-run this effect whenever "running" changes  
  }, [running]);
  
  // Reset Function
  const handleReset = () => {

    // Remember if the timer was running before pressing Reset
    const wasRunning = running;

    // Pause the timer while the dialog is open
    setRunning(false);

    const doReset = () => {
      setTotal(30 * 60);
      setRunning(true);
    };

    const cancelReset = () => setRunning(wasRunning);

    // Browser (PC): use window.confirm
    if (Platform.OS === 'web') {
      const ok = window.confirm('Are you sure you want to reset?');
      if (ok) doReset();
      else cancelReset();
      return;
    }

    // Phone (iOS / Android): use Alert
    Alert.alert(
      'Reset',
      'Are you sure you want to reset?',
      [
        { text: 'No', style: 'cancel', onPress: cancelReset },
        { text: 'Yes', onPress: doReset },
      ],
      { cancelable: true, onDismiss: cancelReset }
    );
  };

  return (

    <View style={{ flex: 1 }}>

      {/*Background Color*/}
      <View style={{ flex: 1, backgroundColor: '#000000' }}>

        {/*Application Title*/}
        <Text style={{ color: 'white', fontSize: 28}}>DeckFit</Text>

        {/*Timer*/}
        <Text style={{ color: 'white', fontSize: 48, fontWeight: '700' }}>{fmt(total)}</Text>

        {/*Buttons*/}
        <View style={{ flexDirection: 'row', marginTop: 16 }}>

          {/*Pause/Resume Button*/}
          <Pressable
            onPress={() => setRunning(!running)}
            style={{ backgroundColor: '#e8b84a', padding: 14, borderRadius: 30, marginRight: 12 }}
          >
            <Text style={{ fontWeight: '800' }}>{running ? 'Pause' : 'Resume'}</Text>
          </Pressable>

          {/*Reset Button*/}
          <Pressable
            onPress={handleReset}
            style={{ backgroundColor: '#555555', padding: 14, borderRadius: 30 }}
          >
            <Text style={{ color: 'white', fontWeight: '800' }}>Reset</Text>
          </Pressable>

        </View>                 
      </View>
    </View>
  );
}