import '@testing-library/jest-dom';

class TextEncoderPolyfill {
  encode(str: string): Uint8Array {
    const arr = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      arr[i] = str.charCodeAt(i);
    }
    return arr;
  }
}

class TextDecoderPolyfill {
  decode(arr?: Uint8Array): string {
    if (!arr) return '';
    return String.fromCharCode(...arr);
  }
}

if (typeof globalThis.TextEncoder === 'undefined') {
  Object.assign(globalThis, { 
    TextEncoder: TextEncoderPolyfill, 
    TextDecoder: TextDecoderPolyfill 
  });
}

jest.mock('lucide-react', () => ({
  Mail: () => 'MailIcon',
  Lock: () => 'LockIcon',
  Eye: () => 'EyeIcon',
  EyeOff: () => 'EyeOffIcon',
  Loader2: () => 'Loader2Icon',
}));
