import { Alert, Platform } from 'react-native';

/**
 * Cross-platform alert utility
 * Works on both web and mobile platforms
 */

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

/**
 * Show a simple alert with OK button
 */
export function showAlert(title: string, message?: string, onOk?: () => void) {
  if (Platform.OS === 'web') {
    window.alert(`${title}${message ? '\n\n' + message : ''}`);
    if (onOk) onOk();
  } else {
    Alert.alert(title, message, [
      { text: 'OK', onPress: onOk }
    ]);
  }
}

/**
 * Show a confirmation dialog with OK/Cancel buttons
 */
export function showConfirm(
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) {
  if (Platform.OS === 'web') {
    const confirmed = window.confirm(`${title}\n\n${message}`);
    if (confirmed) {
      onConfirm();
    } else if (onCancel) {
      onCancel();
    }
  } else {
    Alert.alert(title, message, [
      { text: 'Hủy', style: 'cancel', onPress: onCancel },
      { text: 'OK', onPress: onConfirm }
    ]);
  }
}

/**
 * Show a custom alert with multiple buttons
 * For web: only supports up to 2 buttons (Cancel + OK)
 * For mobile: supports all buttons
 */
export function showAlertWithButtons(
  title: string,
  message: string,
  buttons: AlertButton[]
) {
  if (Platform.OS === 'web') {
    // Web only supports confirm (2 buttons max)
    if (buttons.length === 1) {
      // Single button - just show alert
      window.alert(`${title}\n\n${message}`);
      if (buttons[0].onPress) buttons[0].onPress();
    } else if (buttons.length === 2) {
      // Two buttons - use confirm
      const cancelButton = buttons.find(b => b.style === 'cancel');
      const confirmButton = buttons.find(b => b.style !== 'cancel') || buttons[1];
      
      const confirmed = window.confirm(`${title}\n\n${message}`);
      if (confirmed && confirmButton.onPress) {
        confirmButton.onPress();
      } else if (!confirmed && cancelButton?.onPress) {
        cancelButton.onPress();
      }
    } else {
      // More than 2 buttons - show numbered options
      const options = buttons
        .filter(b => b.style !== 'cancel')
        .map((b, i) => `${i + 1}. ${b.text}`)
        .join('\n');
      
      const choice = window.prompt(
        `${title}\n\n${message}\n\n${options}\n\nNhập số để chọn (hoặc Cancel để hủy):`
      );
      
      if (choice === null) {
        // User cancelled
        const cancelButton = buttons.find(b => b.style === 'cancel');
        if (cancelButton?.onPress) cancelButton.onPress();
      } else {
        const index = parseInt(choice) - 1;
        const selectedButton = buttons.filter(b => b.style !== 'cancel')[index];
        if (selectedButton?.onPress) selectedButton.onPress();
      }
    }
  } else {
    // Mobile - use native Alert
    Alert.alert(title, message, buttons);
  }
}

/**
 * Show a destructive confirmation (delete, remove, etc.)
 */
export function showDestructiveConfirm(
  title: string,
  message: string,
  confirmText: string,
  onConfirm: () => void,
  onCancel?: () => void
) {
  if (Platform.OS === 'web') {
    const confirmed = window.confirm(`${title}\n\n${message}\n\nNhấn OK để ${confirmText.toLowerCase()}`);
    if (confirmed) {
      onConfirm();
    } else if (onCancel) {
      onCancel();
    }
  } else {
    Alert.alert(title, message, [
      { text: 'Hủy', style: 'cancel', onPress: onCancel },
      { text: confirmText, style: 'destructive', onPress: onConfirm }
    ]);
  }
}
