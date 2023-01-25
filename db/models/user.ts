import { model, mongo, Schema, Document } from 'mongoose';
const mongoModel = model(
    'user',
    new Schema({
        id: { type: String, required: true, unique: true },
    })
);
export type UserType = Document<unknown, any, typeof mongoModel> & {
    id: string
}
export default mongoModel;
