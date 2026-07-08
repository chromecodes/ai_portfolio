export class MinHeap<T> {
  private heap: T[] = []

  constructor(private compare: (a: T, b: T) => number) {}

  get size() {
    return this.heap.length
  }

  isEmpty() {
    return this.heap.length === 0
  }

  push(item: T) {
    this.heap.push(item)
    this.bubbleUp(this.heap.length - 1)
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined
    const root = this.heap[0]
    const last = this.heap.pop()!

    if (this.heap.length > 0) {
      this.heap[0] = last
      this.bubbleDown(0)
    }

    return root
  }

  private bubbleUp(index: number) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2)
      if (this.compare(this.heap[index], this.heap[parent]) >= 0) break
      this.swap(index, parent)
      index = parent
    }
  }

  private bubbleDown(index: number) {
    const length = this.heap.length

    while (true) {
      let smallest = index
      const left = index * 2 + 1
      const right = index * 2 + 2

      if (
        left < length &&
        this.compare(this.heap[left], this.heap[smallest]) < 0
      ) {
        smallest = left
      }

      if (
        right < length &&
        this.compare(this.heap[right], this.heap[smallest]) < 0
      ) {
        smallest = right
      }

      if (smallest === index) break
      this.swap(index, smallest)
      index = smallest
    }
  }

  private swap(i: number, j: number) {
    ;[this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]]
  }
}
