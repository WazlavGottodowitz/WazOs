export class TimelineStore {
  constructor(limit = 32) {
    this.limit = limit;
    this.frames = [];
  }

  add(frame) {
    this.frames.unshift(frame);
    if (this.frames.length > this.limit) {
      this.frames.length = this.limit;
    }
    return this.frames;
  }

  remove(index) {
    this.frames.splice(index, 1);
    return this.frames;
  }

  clear() {
    this.frames = [];
    return this.frames;
  }

  all() {
    return [...this.frames];
  }

  count() {
    return this.frames.length;
  }
}
