type TextStreamSave = number;

class TextStream {
    text: string;
    position: number;

    constructor(text: string) {
        this.text = text;
        this.position = -1;
    }

    pick(): string | null {
        if (this.position < this.text.length && this.position >= 0) {
            return this.text[this.position];
        } else {
            return null;
        }
    }

    getchar(): string | null {
        this.position++;
        return this.pick();
    }

    ungetchar(): void {
        if (this.position >= 0) {
            this.position--;
        }
    }

    save(): TextStreamSave {
        return this.position;
    }

    restore(position: TextStreamSave) {
        this.position = position;
    }
}
