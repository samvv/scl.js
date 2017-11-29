
import { get } from "../util"
import { StructIndex, registerContainer } from "../mi"
import { Hash, SingleKeyHash } from "../hash"
import Types from "../types"

registerContainer({
  name: 'hash', 
  elementType: Types.Array(Types.Key(), Types.Value()),
  optimized: true,
  paramTypes: [
    Types.Hasher(Types.Key()),
    Types.Equality(Types.Key(), Types.Key()),
    Types.Equality(Types.Value(), Types.Value()),
    Types.KeyGetter(),
    Types.Number(),
  ],
  buildUnique(...args) {
    return new StructIndex(new SingleKeyHash(...args));
  },
  build(...args) {
    return new StructIndex(new Hash(...args));
  }
});

