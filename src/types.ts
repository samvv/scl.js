
import TypeSet, { Type } from "reflect-types"
import { _1 } from "reflect-types/placeholders"

export { Type };

const s = new TypeSet();
const Types = s.types;

Types.Lesser = (typeA: Type, typeB: Type) => Types.Function({ returnType: Types.Boolean(), paramTypes: [typeA, typeB] });
Types.Equality = (typeA: Type, typeB: Type) => Types.Function({ returnType: Types.Boolean(), paramTypes: [typeA, typeB] });
Types.Hasher = (valType: Type) => Types.Function({ returnType: Types.Number(), paramTypes: [valType] });

export default Types;

