// Global AudioContext to prevent multiple instances
let audioContext: AudioContext | null = null;

// Initialize AudioContext safely
const getAudioContext = () => {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('AudioContext not supported or blocked:', error);
      return null;
    }
  }
  
  // Resume context if suspended
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(console.warn);
  }
  
  return audioContext;
};

// Sound utility functions
export const playCompletionSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  try {
    // Create oscillator for the sound
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Configure the sound - a pleasant completion chime
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
    
    // Configure volume envelope (50% less volume)
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.5);
    
    // Play the sound
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  } catch (error) {
    console.warn('Error playing completion sound:', error);
  }
};

export const playDeleteSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Lower frequency for delete sound
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.2);
    
    // 50% less volume
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.3);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  } catch (error) {
    console.warn('Error playing delete sound:', error);
  }
};

export const playLevelUpSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  try {
    // Create multiple oscillators for a rich sound
    const oscillators = [];
    const gainNodes = [];
    
    // Create a chord progression for level up
    const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // Stagger the notes (50% less volume)
      gainNode.gain.setValueAtTime(0, ctx.currentTime + index * 0.1);
      gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + index * 0.1 + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + index * 0.1 + 0.8);
      
      oscillator.start(ctx.currentTime + index * 0.1);
      oscillator.stop(ctx.currentTime + index * 0.1 + 0.8);
      
      oscillators.push(oscillator);
      gainNodes.push(gainNode);
    });
  } catch (error) {
    console.warn('Error playing level up sound:', error);
  }
};

export const playHoverSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Soft hover sound
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(1000, ctx.currentTime + 0.1);
    
    // 50% less volume
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.15);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  } catch (error) {
    console.warn('Error playing hover sound:', error);
  }
};

export const playClickSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Quick click sound
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.05);
    
    // 50% less volume
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.075, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.08);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.08);
  } catch (error) {
    console.warn('Error playing click sound:', error);
  }
};

export const playAchievementSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  try {
    // Create multiple oscillators for achievement sound
    const oscillators = [];
    const gainNodes = [];
    
    // Create a triumphant sound
    const frequencies = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    
    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // Create a fanfare effect (50% less volume)
      gainNode.gain.setValueAtTime(0, ctx.currentTime + index * 0.08);
      gainNode.gain.linearRampToValueAtTime(0.125, ctx.currentTime + index * 0.08 + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + index * 0.08 + 0.6);
      
      oscillator.start(ctx.currentTime + index * 0.08);
      oscillator.stop(ctx.currentTime + index * 0.08 + 0.6);
      
      oscillators.push(oscillator);
      gainNodes.push(gainNode);
    });
  } catch (error) {
    console.warn('Error playing achievement sound:', error);
  }
};

export const playErrorSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Error sound - descending tone
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(300, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.3);
    
    // 50% less volume
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.4);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.4);
  } catch (error) {
    console.warn('Error playing error sound:', error);
  }
};

export const playSuccessSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  try {
    // Create multiple oscillators for success sound
    const oscillators = [];
    const gainNodes = [];
    
    // Create a pleasant success sound
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // Stagger the notes for a pleasant effect
      gainNode.gain.setValueAtTime(0, ctx.currentTime + index * 0.05);
      gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + index * 0.05 + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + index * 0.05 + 0.3);
      
      oscillator.start(ctx.currentTime + index * 0.05);
      oscillator.stop(ctx.currentTime + index * 0.05 + 0.3);
      
      oscillators.push(oscillator);
      gainNodes.push(gainNode);
    });
  } catch (error) {
    console.warn('Error playing success sound:', error);
  }
};

export const playNotificationSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Gentle notification sound
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, ctx.currentTime);
    oscillator.frequency.setValueAtTime(800, ctx.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(600, ctx.currentTime + 0.2);
    
    // 50% less volume
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.075, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.3);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  } catch (error) {
    console.warn('Error playing notification sound:', error);
  }
};

export const playGameCoinSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Coin collection sound
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.1);
    
    // 50% less volume
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.15);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  } catch (error) {
    console.warn('Error playing game coin sound:', error);
  }
};

export const playModalOpenSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Modal open sound - ascending tone
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.2);
    
    // 50% less volume
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.075, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.25);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.25);
  } catch (error) {
    console.warn('Error playing modal open sound:', error);
  }
};