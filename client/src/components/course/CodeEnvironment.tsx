import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Save, 
  RefreshCcw, 
  Code, 
  FileText, 
  Terminal, 
  Download,
  Share2,
  Maximize2
} from 'lucide-react';

interface CodeEnvironmentProps {
  initialCode?: string;
  initialLanguage?: 'python' | 'javascript' | 'html';
  instructions?: string;
  readOnly?: boolean;
  onCodeRun?: (code: string) => void;
  onCodeSave?: (code: string) => void;
}

const CodeEnvironment: React.FC<CodeEnvironmentProps> = ({
  initialCode = '# Enter your code here\nprint("Hello, AI!")',
  initialLanguage = 'python',
  instructions = 'Create a simple program that prints a greeting message.',
  readOnly = false,
  onCodeRun,
  onCodeSave
}) => {
  const [code, setCode] = useState<string>(initialCode);
  const [language, setLanguage] = useState<'python' | 'javascript' | 'html'>(initialLanguage);
  const [output, setOutput] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Sample code templates
  const codeTemplates = {
    python: '# Enter your Python code here\nprint("Hello, AI!")',
    javascript: '// Enter your JavaScript code here\nconsole.log("Hello, AI!");',
    html: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Page</title>\n</head>\n<body>\n  <h1>Hello, AI!</h1>\n</body>\n</html>'
  };

  // Handle language change
  const handleLanguageChange = (newLanguage: 'python' | 'javascript' | 'html') => {
    if (code === initialCode || code === codeTemplates[language]) {
      // If user hasn't changed the template, switch to the new template
      setCode(codeTemplates[newLanguage]);
    } else if (confirm('Changing language will reset your code. Continue?')) {
      setCode(codeTemplates[newLanguage]);
    } else {
      return; // User cancelled
    }
    setLanguage(newLanguage);
  };

  // Simulate code execution
  const runCode = () => {
    setIsRunning(true);
    setOutput('Running...');
    
    // Simulate execution delay
    setTimeout(() => {
      let simulatedOutput = '';
      
      // Generate simulated output based on language
      if (language === 'python') {
        if (code.includes('print(')) {
          // Extract content from print statements
          const printMatches = code.match(/print\((["'])(.*?)\1\)/g);
          if (printMatches) {
            simulatedOutput = printMatches
              .map(match => {
                const content = match.match(/print\((["'])(.*?)\1\)/);
                return content ? content[2] : '';
              })
              .join('\n');
          } else {
            simulatedOutput = 'No output generated';
          }
        } else if (code.includes('def ')) {
          simulatedOutput = 'Function defined successfully';
        } else {
          simulatedOutput = 'Code executed successfully with no output';
        }
      } else if (language === 'javascript') {
        if (code.includes('console.log(')) {
          // Extract content from console.log statements
          const logMatches = code.match(/console\.log\((["'])(.*?)\1\)/g);
          if (logMatches) {
            simulatedOutput = logMatches
              .map(match => {
                const content = match.match(/console\.log\((["'])(.*?)\1\)/);
                return content ? content[2] : '';
              })
              .join('\n');
          } else {
            simulatedOutput = 'No output generated';
          }
        } else {
          simulatedOutput = 'Code executed successfully with no output';
        }
      } else {
        simulatedOutput = 'HTML preview would be displayed here';
      }
      
      setOutput(simulatedOutput);
      setIsRunning(false);
      
      // Call the onCodeRun callback if provided
      if (onCodeRun) {
        onCodeRun(code);
      }
    }, 1500);
  };

  // Save code
  const saveCode = () => {
    if (onCodeSave) {
      onCodeSave(code);
    }
    // Show success message
    setOutput('Code saved successfully!');
    setTimeout(() => {
      if (output === 'Code saved successfully!') {
        setOutput('');
      }
    }, 3000);
  };

  // Reset code to initial state
  const resetCode = () => {
    if (confirm('Are you sure you want to reset your code? All changes will be lost.')) {
      setCode(codeTemplates[language]);
      setOutput('');
    }
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Generate syntax highlighting classes (simplified version)
  const highlightSyntax = (code: string): string => {
    // In a real implementation, you would use a library like Prism.js or highlight.js
    // This is a simplified version for demonstration purposes
    if (language === 'python') {
      return code
        .replace(/(#.*)/g, '<span class="text-gray-400">$1</span>') // Comments
        .replace(/(["'])(.*?)\1/g, '<span class="text-yellow-400">$1$2$1</span>') // Strings
        .replace(/\b(def|if|else|for|while|import|from|as|return|print)\b/g, '<span class="text-purple-400">$1</span>'); // Keywords
    } else if (language === 'javascript') {
      return code
        .replace(/(\/\/.*)/g, '<span class="text-gray-400">$1</span>') // Comments
        .replace(/(["'])(.*?)\1/g, '<span class="text-yellow-400">$1$2$1</span>') // Strings
        .replace(/\b(const|let|var|function|if|else|for|while|return|console)\b/g, '<span class="text-purple-400">$1</span>'); // Keywords
    } else if (language === 'html') {
      return code
        .replace(/(&lt;[^&]*&gt;)/g, '<span class="text-blue-400">$1</span>') // Tags
        .replace(/(["'])(.*?)\1/g, '<span class="text-yellow-400">$1$2$1</span>'); // Strings
    }
    return code;
  };

  return (
    <Card className={`bg-gray-900 border-gray-700 p-0 overflow-hidden transition-all duration-300 ${
      isFullscreen ? 'fixed inset-0 z-50 m-0 rounded-none' : ''
    }`}>
      <div className="border-b border-gray-800 bg-gray-850 p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-electric-cyan-400" />
          <h3 className="font-bold">Interactive Code Environment</h3>
        </div>
        <div className="flex gap-2">
          <TabsList className="bg-gray-800">
            <TabsTrigger 
              value="python" 
              onClick={() => handleLanguageChange('python')}
              className={language === 'python' ? 'bg-gray-700' : ''}
            >
              Python
            </TabsTrigger>
            <TabsTrigger 
              value="javascript" 
              onClick={() => handleLanguageChange('javascript')}
              className={language === 'javascript' ? 'bg-gray-700' : ''}
            >
              JavaScript
            </TabsTrigger>
            <TabsTrigger 
              value="html" 
              onClick={() => handleLanguageChange('html')}
              className={language === 'html' ? 'bg-gray-700' : ''}
            >
              HTML
            </TabsTrigger>
          </TabsList>
          <Button variant="outline" size="icon" onClick={toggleFullscreen}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 h-[500px]">
        {/* Code editor */}
        <div className="border-r border-gray-800 flex flex-col h-full">
          <div className="p-2 border-b border-gray-800 bg-gray-850 flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="text-sm">Editor</span>
            </div>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetCode}
                disabled={readOnly}
                className="h-8 px-2 text-gray-400 hover:text-white"
              >
                <RefreshCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={saveCode}
                disabled={readOnly}
                className="h-8 px-2 text-gray-400 hover:text-white"
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-gray-950 p-0">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-transparent text-white font-mono text-sm p-4 resize-none focus:outline-none"
              spellCheck="false"
              disabled={readOnly}
            />
          </div>
          <div className="p-2 border-t border-gray-800 bg-gray-850 flex justify-between items-center">
            <span className="text-xs text-gray-500">{code.split('\n').length} lines</span>
            <Button 
              variant="default" 
              size="sm" 
              onClick={runCode}
              disabled={isRunning}
              className="h-8 bg-electric-cyan-600 hover:bg-electric-cyan-700"
            >
              {isRunning ? (
                <>
                  <RefreshCcw className="h-4 w-4 mr-1 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Run Code
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Output and instructions */}
        <div className="flex flex-col h-full">
          <Tabs defaultValue="output" className="flex-1 flex flex-col">
            <div className="p-2 border-b border-gray-800 bg-gray-850 flex justify-between items-center">
              <TabsList className="bg-gray-800">
                <TabsTrigger value="output">
                  <Terminal className="h-4 w-4 mr-1" />
                  Output
                </TabsTrigger>
                <TabsTrigger value="instructions">
                  <FileText className="h-4 w-4 mr-1" />
                  Instructions
                </TabsTrigger>
              </TabsList>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 px-2 text-gray-400 hover:text-white"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 px-2 text-gray-400 hover:text-white"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>
            
            <TabsContent value="output" className="flex-1 p-0 m-0">
              <div className="h-full bg-black p-4 font-mono text-sm overflow-auto">
                {output ? (
                  <pre className="text-green-400">{output}</pre>
                ) : (
                  <div className="text-gray-500 italic">Run your code to see output here</div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="instructions" className="flex-1 p-0 m-0">
              <div className="h-full bg-gray-900 p-4 overflow-auto">
                <h4 className="text-lg font-bold mb-3">Exercise Instructions</h4>
                <div className="prose prose-invert max-w-none">
                  <p>{instructions}</p>
                  
                  <h5 className="text-md font-bold mt-4 mb-2">Objectives:</h5>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Understand basic syntax in {language === 'python' ? 'Python' : language === 'javascript' ? 'JavaScript' : 'HTML'}</li>
                    <li>Create a working program that produces the expected output</li>
                    <li>Practice debugging and problem-solving skills</li>
                  </ul>
                  
                  <h5 className="text-md font-bold mt-4 mb-2">Hints:</h5>
                  <ul className="list-disc list-inside space-y-1">
                    {language === 'python' && (
                      <>
                        <li>Remember to use <code className="bg-gray-800 px-1 rounded">print()</code> to display output</li>
                        <li>Python is indentation-sensitive</li>
                      </>
                    )}
                    {language === 'javascript' && (
                      <>
                        <li>Use <code className="bg-gray-800 px-1 rounded">console.log()</code> to display output</li>
                        <li>Remember to end statements with semicolons</li>
                      </>
                    )}
                    {language === 'html' && (
                      <>
                        <li>Make sure to include proper opening and closing tags</li>
                        <li>The structure should include html, head, and body sections</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Card>
  );
};

export default CodeEnvironment;