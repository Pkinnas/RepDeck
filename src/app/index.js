import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, Text, View } from 'react-native';

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Convert Time (seconds in minutes)
const fmt = (s) =>
          `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

// Returns how many reps a card is worth
// Ace = 1, face cards (J, Q, K) = 10, number cards = their number
const getReps = (rank) => {
  if (rank === 'A') return 1;
  if (rank === 'J' || rank === 'Q' || rank === 'K') return 10;
  return Number(rank);
};

// Red for hearts and diamonds, black for spades and clubs
const getColor = (suit) => (suit === '♥' || suit === '♦' ? '#c0281c' : '#1c1c1c');

// Build the full deck: every suit combined with every rank
const buildDeck = () => {
  const cards = [];

  SUITS.forEach((suit) => {
    RANKS.forEach((rank) => {
      cards.push({ rank: rank, suit: suit, reps: getReps(rank) });
    });
  });
  return cards;
};

const deck = buildDeck();

export default function Index() {

  const [total, setTotal] = useState(30 * 60);
  const [running, setRunning] = useState(false);
  // The cards still left in the deck (starts as the full deck)
  const [remaining, setRemaining] = useState(deck);
  // The two cards drawn the last time (empty at the start)
  const [hand, setHand] = useState([]);
  // Total reps counted so far
  const [totalReps, setTotalReps] = useState(0);
  // Number of sets so far (2 cards = 1 set)
  const [sets, setSets] = useState(0);

  // Timer: runs every time "running" changes
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
      setRunning(false);
      setRemaining(deck);   // full deck again
      setHand([]);          // no cards on the table
      setTotalReps(0);      // reps back to zero
      setSets(0);           // sets back to zero
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

  // Draw 2 Cards
  const drawTwo = () => {
    // Not enough cards left: do nothing
    if (remaining.length < 2) return;

    // Copy of the list
    const cards = [...remaining];

    // Take the first random card out of the copy
    const index1 = Math.floor(Math.random() * cards.length);
    // Remove the element from the list
    const first = cards.splice(index1, 1)[0];

    // Take the second random card out of the copy
    const index2 = Math.floor(Math.random() * cards.length);
    // Remove the element from the list
    const second = cards.splice(index2, 1)[0];

    setHand([first, second]);
    // Change the remaining list
    setRemaining(cards);

    // Add the reps of the two new cards, and count one more set
    setTotalReps(totalReps + first.reps + second.reps);
    setSets(sets + 1);

    // Start the timer
    setRunning(true);
};

  return (

    <View style={{ flex: 1 }}>

      {/*Background Color*/}
      <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center'}}>

        {/* Timer*/}
        <Text style={{ color: 'white', fontSize: 46, fontWeight: '800', textAlign: 'center', marginTop: 8 }}>
          {fmt(total)}
        </Text>

        {/* Pause/Resume and Reset buttons, side by side */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>

          {/*Pause/Resume Button*/}
          <Pressable
            onPress={() => {
              // Before the first Draw there is nothing to pause
              if (hand.length === 0) return;
              setRunning(!running);
            }}
            style={{
              backgroundColor: '#e8b84a',
              padding: 14,
              borderRadius: 30,
              marginRight: 12,
              opacity: hand.length === 0 ? 0.5 : 1,
            }}
          >
            <Text style={{ fontWeight: '800' }}>
              {running || hand.length === 0 ? 'Pause' : 'Resume'}
            </Text>
          </Pressable>

          {/*Reset Button*/}
          <Pressable
            onPress={handleReset}
            style={{ backgroundColor: '#555555', padding: 14, borderRadius: 30 }}
          >
            <Text style={{ color: 'white', fontWeight: '800' }}>Reset</Text>
          </Pressable>

        </View>
                        
        {/* Cards and total: shown only after the cards have been drawn */}
        {hand.length === 2 && (
          <View>

            {/* The two cards */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>

              {/* Card 1 */}
              <View style={{ width: 130, height: 190, backgroundColor: '#f5efe0', borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                <Text style={{ fontSize: 44, fontWeight: '800', color: getColor(hand[0].suit) }}>{hand[0].rank}</Text>
                <Text style={{ fontSize: 56, color: getColor(hand[0].suit) }}>{hand[0].suit}</Text>
              </View>

              {/* Card 2 */}
              <View style={{ width: 130, height: 190, backgroundColor: '#f5efe0', borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 44, fontWeight: '800', color: getColor(hand[1].suit) }}>{hand[1].rank}</Text>
                <Text style={{ fontSize: 56, color: getColor(hand[1].suit) }}>{hand[1].suit}</Text>
              </View>

            </View>

            {/* Total reps of the two cards */}
            <Text style={{ color: 'white', fontSize: 22, fontWeight: '700', textAlign: 'center', marginTop: 16 }}>
              <Text style={{ color: '#e8b84a', fontSize: 32 }}>{hand[0].reps + hand[1].reps}</Text> reps on deck
            </Text>

            {/* Sets and total reps */}
            <Text style={{ color: 'white', fontSize: 18, textAlign: 'center', marginTop: 8 }}>
              Sets: <Text style={{ color: '#e8b84a', fontWeight: '800' }}>{sets}</Text>
              {'  ·  '}
              Total reps: <Text style={{ color: '#e8b84a', fontWeight: '800' }}>{totalReps}</Text>
            </Text>

          </View>
        )}

        {/*Draw Button*/}
        <Pressable
            onPress={drawTwo}
            style={{ backgroundColor: '#e8b84a', padding: 14, borderRadius: 30, marginTop: 16, alignSelf: 'center' }}
          >
            <Text style={{ fontWeight: '800' }}>Draw</Text>
        </Pressable>

         {/*Remaining Cards*/} 
        <Text style={{ color: '#cfe3d8', textAlign: 'center', marginTop: 8 }}>
          Cards left: {remaining.length}
        </Text>
           
      </View>
    </View>
  );
}