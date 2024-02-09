import { StringPathResult } from "./string_path_result";
import { IO } from "../../cli/io";
import { MatchResult } from "../../parsing/match_results";
import { PointerStack } from "../../parsing/pointers";
import { strictIdentifierRegex } from "../constants";
import { Grammar } from "../grammar";
import { escapeRegex, markPointersAsConsumed } from "../utils";
import { Rule } from "./rule_interface";

export class ConstantRule implements Rule {
    token: string;
    regex: RegExp;
    origRule: string;

    constructor(t: string, origin: string) {
        this.token = t;
        this.origRule = origin;
        let escapedString = escapeRegex(t)
        if (t.match(strictIdentifierRegex)) {
            this.regex = new RegExp("^.\\b" + escapedString + "\\b");
        } else {
            this.regex = new RegExp("^." + escapedString + "");
        }
    }

    toString(): string {
        return '"' + this.token + '"'
    }

    toStringAsPath(isLeaf: boolean, index: number, offset: number): StringPathResult {
        return new StringPathResult(
            " ".repeat(offset) + this.toString(),
            offset
        );
    }

    match(expression: string, pointer: PointerStack, grammar: Grammar, io: IO): MatchResult {
        if (expression.match(this.regex)) {
            // pop me from stack and increment string position
            let newStack = pointer.stack.slice(0, pointer.stack.length - 1);
            let markedStack = markPointersAsConsumed(newStack);
            let newPointer = new PointerStack(markedStack, pointer.stringPosition + this.token.length);

            return new MatchResult([newPointer], [], []);
        } else {
            // fail
            return new MatchResult([], [], [pointer]);
        }
    }

    canTrim(idx: number, consumedSomething: boolean): boolean {
        return consumedSomething;
    }
}