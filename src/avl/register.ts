
import Types from "../types"
import { StructIndex, registerContainer } from "../mi"
import AVL from "./index"

registerContainer({
  name: 'avl', 
  elementType: Types.Array(Types.Key(), Types.Value()),
  paramTypes: [Types.Lesser(Types.Key(), Types.Key()), Types.KeyGetter(), Types.Equality(Types.Value(), Types.Value())],
  build(...args) {
    return new StructIndex(new AVL<any>(...args));
  }
});

