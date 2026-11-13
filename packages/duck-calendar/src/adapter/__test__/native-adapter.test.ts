import { NativeAdapter } from '../native-adapter'
import { runAdapterTests } from './adapter-test-suite'

runAdapterTests(
  'NativeAdapter',
  () => new NativeAdapter(),
  (y, m, d, h, min, s) => new Date(y, m, d, h ?? 0, min ?? 0, s ?? 0),
)
