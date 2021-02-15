export const UID = {
  _id: 1,
  get() {
    return this._id++
  },
}
