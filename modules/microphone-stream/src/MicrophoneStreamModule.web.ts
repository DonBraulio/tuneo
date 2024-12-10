import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './MicrophoneStream.types';

type MicrophoneStreamModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class MicrophoneStreamModule extends NativeModule<MicrophoneStreamModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(MicrophoneStreamModule);
