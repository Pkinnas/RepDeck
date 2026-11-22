import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

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
  // True when the deck is finished (shows the finish dialog)
  const [finished, setFinished] = useState(false);
  // Is the reset dialog open?
  const [resetVisible, setResetVisible] = useState(false);
  // Was the timer running before Reset was pressed?
  const [wasRunning, setWasRunning] = useState(false);
  // True when the 30 minutes are over
  const [timeUp, setTimeUp] = useState(false);

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

  // Watches the time: when it reaches 0, stop the timer and show the dialog
  useEffect(() => {
    if (total <= 0) {
      setRunning(false);
      setTimeUp(true);
    }
  }, [total]);
  
  // Puts the app back to the starting screen
  const doReset = () => {
    setTotal(30 * 60);
    setRunning(false);
    setRemaining(deck);
    setHand([]);
    setTotalReps(0);
    setSets(0);
    setFinished(false);
    setTimeUp(false);
  };

  // Reset pressed: remember the timer state, pause it, open the dialog
  const handleReset = () => {
    setWasRunning(running);
    setRunning(false);
    setResetVisible(true);
  };

  // "Yes": reset everything and close the dialog
  const confirmReset = () => {
    doReset();
    setResetVisible(false);
  };

  // "No": close the dialog and go back to the previous timer state
  const cancelReset = () => {
    setRunning(wasRunning);
    setResetVisible(false);
  };

  // Draw 2 Cards
  const drawTwo = () => {
    // Not enough cards left: do nothing
    if (remaining.length < 2) {
      setRunning(false);
      setFinished(true);
      return;
    }

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

  // Finish pressed: stop the timer and show the finish dialog
  const handleFinish = () => {
    setRunning(false);
    setFinished(true);
  };

  return (
    <View style={{ flex: 1 }}>

      {/*Background Color*/}
      <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center'}}>

        {/* Timer*/}
        <Text style={{ color: 'white', fontSize: 46, fontWeight: '800', textAlign: 'center', marginTop: 8 }}>
          {fmt(total)}
        </Text>

        {/* Pause/Resume and Reset buttons*/}
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

        {/* Draw and Finish buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>

          {/*Draw Button*/}
          <Pressable
            onPress={drawTwo}
            style={{ backgroundColor: '#e8b84a', padding: 14, borderRadius: 30 }}
          >
            <Text style={{ fontWeight: '800' }}>Draw</Text>
          </Pressable>

          {/*Finish Button: appears after the first Draw*/}
          {hand.length > 0 && (
            <Pressable
              onPress={handleFinish}
              style={{ borderWidth: 2, borderColor: '#e8b84a', padding: 12, borderRadius: 30, marginLeft: 12 }}
            >
              <Text style={{ color: '#e8b84a', fontWeight: '800' }}>Finish</Text>
            </Pressable>
          )}

        </View>
                  
         {/*Remaining Cards*/} 
        <Text style={{ color: '#cfe3d8', textAlign: 'center', marginTop: 8 }}>
          Cards left: {remaining.length}
        </Text>
           
      </View>

        {/* Dialog shown when the deck is finished */}
        <Modal
          visible={finished}
          transparent={true}
          animationType="fade"
          onRequestClose={doReset}
        >

          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' }}>
            {/* The dialog box */}
            <View style={{ backgroundColor: '#1c1c1c', borderRadius: 16, padding: 24, width: '80%', maxWidth: 360 }}>
              <Text style={{ color: 'white', fontSize: 22, fontWeight: '800', textAlign: 'center' }}>
                You finished your workout!
              </Text>

              <Text style={{ color: '#cfe3d8', fontSize: 18, textAlign: 'center', marginTop: 16 }}>
                You did{' '}
                <Text style={{ color: '#e8b84a', fontWeight: '800' }}>{sets}</Text> {sets === 1 ? 'set' : 'sets'},{' '}
                <Text style={{ color: '#e8b84a', fontWeight: '800' }}>{totalReps}</Text> reps in{' '}
                <Text style={{ color: '#e8b84a', fontWeight: '800' }}>{fmt(30 * 60 - total)}</Text>
              </Text>

              <Pressable
                onPress={doReset}
                style={{ backgroundColor: '#e8b84a', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 30, alignSelf: 'center', marginTop: 24 }}
              >
                <Text style={{ fontWeight: '800' }}>OK</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Reset confirmation dialog */}
        <Modal
          visible={resetVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={cancelReset}
        >
          {/* Dark background that centers the box */}
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' }}>

            {/* The dialog box */}
            <View style={{ backgroundColor: '#1c1c1c', borderRadius: 16, padding: 24, width: '80%', maxWidth: 360 }}>
              <Text style={{ color: 'white', fontSize: 22, fontWeight: '800', textAlign: 'center' }}>
                Reset
              </Text>
              <Text style={{ color: '#cfe3d8', fontSize: 16, textAlign: 'center', marginTop: 12 }}>
                Are you sure you want to reset?
              </Text>

              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
                <Pressable
                  onPress={cancelReset}
                  style={{ backgroundColor: '#555555', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 30, marginRight: 12 }}
                >
                  <Text style={{ color: 'white', fontWeight: '800' }}>No</Text>
                </Pressable>

                <Pressable
                  onPress={confirmReset}
                  style={{ backgroundColor: '#e8b84a', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 30 }}
                >
                  <Text style={{ fontWeight: '800' }}>Yes</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Dialog shown when the time is up */}
        <Modal
          visible={timeUp}
          transparent={true}
          animationType="fade"
          onRequestClose={doReset}
        >
          {/* Dark background that centers the box */}
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' }}>

            {/* The dialog box */}
            <View style={{ backgroundColor: '#1c1c1c', borderRadius: 16, padding: 24, width: '80%', maxWidth: 360 }}>
              <Text style={{ color: 'white', fontSize: 22, fontWeight: '800', textAlign: 'center' }}>
                Time's up!
              </Text>

              <Text style={{ color: '#cfe3d8', fontSize: 18, textAlign: 'center', marginTop: 16 }}>
                You did{' '}
                <Text style={{ color: '#e8b84a', fontWeight: '800' }}>{sets}</Text> {sets === 1 ? 'set' : 'sets'} and{' '}
                <Text style={{ color: '#e8b84a', fontWeight: '800' }}>{totalReps}</Text> reps
              </Text>

              <Pressable
                onPress={doReset}
                style={{ backgroundColor: '#e8b84a', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 30, alignSelf: 'center', marginTop: 24 }}
              >
                <Text style={{ fontWeight: '800' }}>OK</Text>
              </Pressable>
            </View>

          </View>
        </Modal>
        
    </View>
  );
}