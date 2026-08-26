// Exercise the serial setup block. The remaining tests call the parser directly
// so they are deterministic in both the simulator and command-line builds.
teachableAI.startSerial()

teachableAI.handlePredictionLine("Person,0.94")
control.assert(teachableAI.className() == "Person", "decimal class")
control.assert(teachableAI.confidence() == 94, "decimal confidence")
control.assert(teachableAI.rawMessage() == "Person,0.94", "raw message")
control.assert(teachableAI.isClass("Person", 90), "matching class")
control.assert(!teachableAI.isClass("Person", 95), "threshold rejection")
control.assert(!teachableAI.isClass("Car", 80), "class rejection")

teachableAI.handlePredictionLine("Car,87")
control.assert(teachableAI.className() == "Car", "percentage class")
control.assert(teachableAI.confidence() == 87, "percentage confidence")

teachableAI.handlePredictionLine(" Empty , 1 ")
control.assert(teachableAI.className() == "Empty", "trim whitespace")
control.assert(teachableAI.confidence() == 100, "unit confidence")

teachableAI.handlePredictionLine("TooHigh,120")
control.assert(teachableAI.confidence() == 100, "upper clamp")

teachableAI.handlePredictionLine("TooLow,-5")
control.assert(teachableAI.confidence() == 0, "lower clamp")

teachableAI.handlePredictionLine("Invalid,not-a-number")
control.assert(teachableAI.confidence() == 0, "invalid number")

teachableAI.handlePredictionLine("NoComma")
control.assert(teachableAI.className() == "NoComma", "message without comma")
control.assert(teachableAI.confidence() == 100, "default confidence")

// Empty input must preserve the latest valid prediction.
teachableAI.handlePredictionLine("")
control.assert(teachableAI.className() == "NoComma", "empty input preserves class")
control.assert(teachableAI.confidence() == 100, "empty input preserves confidence")
