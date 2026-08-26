//% color=#7C4DFF icon="\uf06e" block="Teachable AI"
namespace teachableAI {
    let currentClass = ""
    let currentConfidence = 0
    let lastLine = ""

    /**
     * Start listening for predictions received over USB serial.
     * Expected line formats: ClassName,0.95 or ClassName,95
     */
    //% blockId=teachable_start_serial
    //% block="start Teachable AI serial"
    //% weight=100
    export function startSerial(): void {
        serial.redirectToUSB()
        serial.setRxBufferSize(128)
        serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
            handlePredictionLine(serial.readUntil(serial.delimiters(Delimiters.NewLine)))
        })
    }

    /** Update the latest prediction from one text line. */
    //% blockId=teachable_handle_line
    //% block="read AI prediction %line"
    //% line.shadowOptions.toString=true
    //% weight=90
    export function handlePredictionLine(line: string): void {
        if (!line) return
        lastLine = line.trim()
        const comma = lastLine.indexOf(",")
        if (comma < 1) {
            currentClass = lastLine
            currentConfidence = 100
            return
        }

        currentClass = lastLine.substr(0, comma).trim()
        let value = parseFloat(lastLine.substr(comma + 1).trim())
        if (isNaN(value)) value = 0
        if (value <= 1) value = value * 100
        currentConfidence = Math.max(0, Math.min(100, Math.round(value)))
    }

    /** Latest predicted class name. */
    //% blockId=teachable_class_name
    //% block="AI class"
    //% weight=80
    export function className(): string {
        return currentClass
    }

    /** Latest prediction confidence from 0 to 100 percent. */
    //% blockId=teachable_confidence
    //% block="AI confidence (%)"
    //% weight=70
    export function confidence(): number {
        return currentConfidence
    }

    /** Test whether the latest class matches a name and minimum confidence. */
    //% blockId=teachable_is_class
    //% block="AI class is %name with confidence at least %minimumConfidence %%"
    //% minimumConfidence.min=0 minimumConfidence.max=100 minimumConfidence.defl=80
    //% weight=60
    export function isClass(name: string, minimumConfidence: number = 80): boolean {
        return currentClass == name && currentConfidence >= minimumConfidence
    }

    /** Last raw prediction line received. */
    //% blockId=teachable_last_line
    //% block="last AI message"
    //% advanced=true
    //% weight=10
    export function rawMessage(): string {
        return lastLine
    }
}
