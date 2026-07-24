import {
  areGapsValuesEqual,
  isValidGapsResolution,
  isValidGapsValue,
} from "./gapsValidation";
import { isValidDuplicatesEditResolution } from "./duplicatesValidation";
import type { IntervalCrossValidationContext } from "./SummaryPanel.types";

export function formatIntervalKey(from: string, to: string) {
  return `${from.trim()}|${to.trim()}`;
}

export function intervalExistsElsewhere(
  from: string,
  to: string,
  otherIntervals: readonly string[],
) {
  return otherIntervals.includes(formatIntervalKey(from, to));
}

function wouldCreateGapAtBoundary(
  boundaryValue: string,
  adjacentValue: string | undefined,
) {
  if (adjacentValue === undefined) {
    return false;
  }

  return !areGapsValuesEqual(boundaryValue, adjacentValue);
}

export function isValidGapsResolutionWithCrossValidation(
  toValue: string,
  fromValue: string,
  context?: IntervalCrossValidationContext,
) {
  if (!isValidGapsResolution(toValue, fromValue)) {
    return false;
  }

  if (!context) {
    return true;
  }

  const boundaryValue = toValue.trim();

  if (
    context.gapAboveRowFrom !== undefined &&
    context.otherIntervals &&
    intervalExistsElsewhere(
      context.gapAboveRowFrom,
      boundaryValue,
      context.otherIntervals,
    )
  ) {
    return false;
  }

  if (
    context.gapBelowRowTo !== undefined &&
    context.otherIntervals &&
    intervalExistsElsewhere(boundaryValue, context.gapBelowRowTo, context.otherIntervals)
  ) {
    return false;
  }

  return true;
}

export function isValidDuplicatesEditWithCrossValidation(
  toValue: string,
  fromValue: string,
  duplicateFrom: string,
  duplicateTo: string,
  context?: IntervalCrossValidationContext,
) {
  if (!isValidDuplicatesEditResolution(toValue, fromValue, duplicateFrom, duplicateTo)) {
    return false;
  }

  if (!context) {
    return true;
  }

  const trimmedFrom = fromValue.trim();
  const trimmedTo = toValue.trim();

  if (wouldCreateGapAtBoundary(trimmedFrom, context.previousRowTo)) {
    return false;
  }

  if (wouldCreateGapAtBoundary(trimmedTo, context.nextRowFrom)) {
    return false;
  }

  if (
    context.otherIntervals?.length &&
    intervalExistsElsewhere(trimmedFrom, trimmedTo, context.otherIntervals)
  ) {
    return false;
  }

  return true;
}

export function getGapsCrossValidationErrorMessage(
  toValue: string,
  fromValue: string,
  context?: IntervalCrossValidationContext,
  field?: "to" | "from",
  toLabel = "To",
  fromLabel = "From",
) {
  if (!isValidGapsResolution(toValue, fromValue) || !context) {
    return "";
  }

  const boundaryValue = field === "from" ? fromValue.trim() : toValue.trim();

  if (
    context.gapAboveRowFrom !== undefined &&
    context.otherIntervals &&
    intervalExistsElsewhere(
      context.gapAboveRowFrom,
      boundaryValue,
      context.otherIntervals,
    )
  ) {
    if (field === "to") {
      return `This ${toLabel} would duplicate the interval on the row above`;
    }

    return `Closing the gap with this ${fromLabel} would duplicate the interval on the row above`;
  }

  if (
    context.gapBelowRowTo !== undefined &&
    context.otherIntervals &&
    intervalExistsElsewhere(boundaryValue, context.gapBelowRowTo, context.otherIntervals)
  ) {
    if (field === "from") {
      return `This ${fromLabel} would duplicate the interval on the row below`;
    }

    return `Closing the gap with this ${toLabel} would duplicate the interval on the row below`;
  }

  return "";
}

export function getDuplicatesCrossValidationErrorMessage(
  toValue: string,
  fromValue: string,
  duplicateFrom: string,
  duplicateTo: string,
  context: IntervalCrossValidationContext | undefined,
  field: "to" | "from",
  fromLabel: string,
  toLabel: string,
) {
  if (!context) {
    return "";
  }

  const trimmedFrom = fromValue.trim();
  const trimmedTo = toValue.trim();

  if (
    trimmedFrom !== "" &&
    trimmedTo !== "" &&
    isValidGapsValue(trimmedFrom) &&
    isValidGapsValue(trimmedTo) &&
    !isDuplicateInterval(trimmedFrom, trimmedTo, duplicateFrom, duplicateTo) &&
    context.otherIntervals?.length &&
    intervalExistsElsewhere(trimmedFrom, trimmedTo, context.otherIntervals)
  ) {
    if (field === "to") {
      return `With ${fromLabel} at ${trimmedFrom}, this interval matches another row`;
    }

    return `With ${toLabel} at ${trimmedTo}, this interval matches another row`;
  }

  if (
    field === "from" &&
    trimmedFrom !== "" &&
    isValidGapsValue(trimmedFrom) &&
    wouldCreateGapAtBoundary(trimmedFrom, context.previousRowTo)
  ) {
    return `Must match ${toLabel} on row above (${context.previousRowTo})`;
  }

  if (
    field === "to" &&
    trimmedTo !== "" &&
    isValidGapsValue(trimmedTo) &&
    wouldCreateGapAtBoundary(trimmedTo, context.nextRowFrom)
  ) {
    return `Must match ${fromLabel} on row below (${context.nextRowFrom})`;
  }

  return "";
}

function isDuplicateInterval(
  fromValue: string,
  toValue: string,
  duplicateFrom: string,
  duplicateTo: string,
) {
  return (
    fromValue.trim() === duplicateFrom.trim() && toValue.trim() === duplicateTo.trim()
  );
}
