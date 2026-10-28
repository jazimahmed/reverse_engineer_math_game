import React from 'react';
import { AnswerView, AnswerViewProps } from './AnswerView';
export function TestView(props: AnswerViewProps) { return <AnswerView {...props} kind="test" />; }
