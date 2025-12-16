import { NodeType } from './types';
import { PlayCircle, BrainCircuit, MessageSquareText, FileOutput, Bot, Sparkles } from 'lucide-react';
import React from 'react';

export const NODE_TEMPLATES = [
  {
    type: NodeType.TRIGGER_START,
    label: 'Manual Trigger',
    description: 'Starts the workflow manually with input text.',
    icon: <PlayCircle className="w-5 h-5 text-emerald-500" />,
    defaultConfig: { initialInput: 'Hello world' }
  },
  {
    type: NodeType.AI_GENERATION,
    label: 'Gemini Generator',
    description: 'Generates text content using Gemini Flash.',
    icon: <Sparkles className="w-5 h-5 text-purple-500" />,
    defaultConfig: { 
      systemInstruction: 'You are a helpful assistant.',
      temperature: 0.7,
      maxOutputTokens: 500
    }
  },
  {
    type: NodeType.AI_ANALYSIS,
    label: 'Sentiment Analysis',
    description: 'Analyzes the sentiment of the input text.',
    icon: <BrainCircuit className="w-5 h-5 text-blue-500" />,
    defaultConfig: {
      aspects: 'sentiment, tone, key_topics'
    }
  },
  {
    type: NodeType.AI_CHAT,
    label: 'Chat Simulator',
    description: 'Simulates a chat response.',
    icon: <MessageSquareText className="w-5 h-5 text-orange-500" />,
    defaultConfig: {
        persona: 'Customer Support'
    }
  },
  {
    type: NodeType.ACTION_OUTPUT,
    label: 'Result Output',
    description: 'Displays the final result of the workflow.',
    icon: <FileOutput className="w-5 h-5 text-slate-500" />,
    defaultConfig: {}
  }
];

export const INITIAL_NODES = [
  {
    id: '1',
    type: NodeType.TRIGGER_START,
    position: { x: 100, y: 200 },
    data: { 
      label: 'Manual Trigger', 
      config: { initialInput: 'Summarize the benefits of React hooks.' },
      status: 'idle'
    },
  },
  {
    id: '2',
    type: NodeType.AI_GENERATION,
    position: { x: 500, y: 200 },
    data: { 
      label: 'Gemini Generator', 
      config: { 
        systemInstruction: 'You are a technical writer. Summarize complex topics simply.',
        temperature: 0.7 
      },
      status: 'idle'
    },
  }
];

export const INITIAL_EDGES = [
  { id: 'e1-2', source: '1', target: '2' }
];
