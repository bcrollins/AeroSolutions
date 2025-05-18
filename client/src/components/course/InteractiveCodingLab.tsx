import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Play, Save, RefreshCw, Lightbulb, Code, FileText, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

interface InteractiveCodingLabProps {
  title: string;
  description?: string;
  initialCode: string;
  language: 'python' | 'javascript' | 'typescript';
  hints?: string[];
  solution?: string;
  testCases?: {
    input: string;
    expectedOutput: string;
    description: string;
  }[];
  onComplete?: (completed: boolean) => void;
}

const InteractiveCodingLab: React.FC<InteractiveCodingLabProps> = ({
  title,
  description,
  initialCode,
  language,
  hints = [],
  solution,
  testCases = [],
  onComplete,
}) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('code');
  const [showSolution, setShowSolution] = useState(false);
  const [visibleHints, setVisibleHints] = useState<number[]>([]);
  const [lastSavedCode, setLastSavedCode] = useState(initialCode);
  const [testResults, setTestResults] = useState<Array<{ passed: boolean; output: string; message: string }>>([]);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Set up syntax highlighting (simple version)
  useEffect(() => {
    // In a real implementation, you'd use a library like Prism.js or CodeMirror
    // This is a simplified placeholder for the concept
    const highlightSyntax = () => {
      // Simple syntax highlighting would be implemented here
    };
    
    highlightSyntax();
  }, [code, language]);
  
  // Auto-save code periodically
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (code !== lastSavedCode) {
        saveCode();
      }
    }, 60000); // Auto-save every minute
    
    return () => clearInterval(autoSaveInterval);
  }, [code, lastSavedCode]);
  
  // Handle tab key in textarea to insert spaces instead of changing focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && document.activeElement === editorRef.current) {
        e.preventDefault();
        const textarea = editorRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          
          // Insert 2 spaces at cursor position
          const newCode = code.substring(0, start) + '  ' + code.substring(end);
          setCode(newCode);
          
          // Move cursor after inserted spaces
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 2;
          }, 0);
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [code]);

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Running code...');
    
    try {
      // In a real implementation, this would send the code to a backend service
      // that would execute it in a sandboxed environment
      
      // Simulate code execution with a delay for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Sample output simulation based on language
      let sampleOutput = '';
      if (language === 'python') {
        if (code.includes('print(')) {
          const printMatch = code.match(/print\((["'])(.*?)\1\)/);
          sampleOutput = printMatch ? printMatch[2] : 'Hello, Python!';
        } else {
          sampleOutput = '# No output (Did you use a print statement?)';
        }
      } else if (language === 'javascript' || language === 'typescript') {
        if (code.includes('console.log(')) {
          const consoleMatch = code.match(/console\.log\((["'])(.*?)\1\)/);
          sampleOutput = consoleMatch ? consoleMatch[2] : 'Hello, JavaScript!';
        } else {
          sampleOutput = '// No output (Did you use console.log?)';
        }
      }
      
      setOutput(sampleOutput);
      
      // For demo purposes, showing a toast on successful execution
      toast({
        title: "Code executed successfully",
        description: "Your code ran without errors.",
        variant: "default",
      });
    } catch (error) {
      let errorMessage = 'An error occurred while executing the code.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setOutput(`Error: ${errorMessage}`);
      
      toast({
        title: "Execution error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runTests = async () => {
    setIsRunning(true);
    setActiveTab('tests');
    
    try {
      // In a real implementation, this would send the code and test cases to a backend
      // Here we're simulating test results
      
      // Simulate test execution with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo, let's simulate some test results
      const simulatedResults = testCases.map((testCase, index) => {
        // Simulate test case execution (in a real app, this would actually run the code)
        const success = Math.random() > 0.3; // 70% chance of success for demo
        return {
          passed: success,
          output: success ? testCase.expectedOutput : "Unexpected output",
          message: success 
            ? "Test passed successfully" 
            : "Output didn't match expected result"
        };
      });
      
      setTestResults(simulatedResults);
      
      // Check if all tests passed
      const allPassed = simulatedResults.every(result => result.passed);
      
      if (allPassed) {
        toast({
          title: "All tests passed!",
          description: "Congratulations! Your solution passed all the test cases.",
          variant: "default",
        });
        
        // Notify parent component
        if (onComplete) {
          onComplete(true);
        }
      } else {
        toast({
          title: "Some tests failed",
          description: "Your code didn't pass all the test cases. Check the details and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Test execution error",
        description: "An error occurred while running the tests.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const saveCode = () => {
    try {
      // Save code to localStorage
      localStorage.setItem(`coding_lab_${title.replace(/\s+/g, '_').toLowerCase()}`, code);
      setLastSavedCode(code);
      
      toast({
        title: "Code saved",
        description: "Your code has been saved successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error saving code:', error);
      toast({
        title: "Save failed",
        description: "There was an error saving your code.",
        variant: "destructive",
      });
    }
  };

  const resetCode = () => {
    if (code !== initialCode) {
      if (confirm("Are you sure you want to reset your code to the initial template? All your changes will be lost.")) {
        setCode(initialCode);
        toast({
          title: "Code reset",
          description: "Your code has been reset to the initial template.",
          variant: "default",
        });
      }
    } else {
      toast({
        title: "Nothing to reset",
        description: "Your code is already at the initial template.",
        variant: "default",
      });
    }
  };

  const toggleHint = (index: number) => {
    if (visibleHints.includes(index)) {
      setVisibleHints(visibleHints.filter(i => i !== index));
    } else {
      setVisibleHints([...visibleHints, index]);
    }
  };

  const toggleSolution = () => {
    if (!showSolution) {
      if (confirm("Are you sure you want to view the solution? Try to solve the challenge on your own first.")) {
        setShowSolution(true);
        setActiveTab('solution');
      }
    } else {
      setShowSolution(false);
    }
  };
  
  // Function to get appropriate language class for styling
  const getLanguageClass = () => {
    switch (language) {
      case 'python':
        return 'language-python';
      case 'javascript':
        return 'language-javascript';
      case 'typescript':
        return 'language-typescript';
      default:
        return 'language-plaintext';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Code className="mr-2 h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="code" className="flex-1">
              <Code className="mr-2 h-4 w-4" />
              Code Editor
            </TabsTrigger>
            <TabsTrigger value="output" className="flex-1">
              <Terminal className="mr-2 h-4 w-4" />
              Output
            </TabsTrigger>
            <TabsTrigger value="tests" className="flex-1">
              <CheckCircle className="mr-2 h-4 w-4" />
              Tests
            </TabsTrigger>
            <TabsTrigger value="hints" className="flex-1">
              <Lightbulb className="mr-2 h-4 w-4" />
              Hints
            </TabsTrigger>
            {solution && (
              <TabsTrigger 
                value="solution" 
                className="flex-1"
                disabled={!showSolution}
              >
                <FileText className="mr-2 h-4 w-4" />
                Solution
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="code" className="min-h-[300px]">
            <div className="relative border rounded-md overflow-hidden bg-gray-50">
              <textarea
                ref={editorRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`w-full h-[300px] p-4 font-mono text-sm resize-none bg-gray-50 focus:outline-none ${getLanguageClass()}`}
                spellCheck="false"
                placeholder={`Write your ${language} code here...`}
              />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Press Tab to indent. The editor supports basic syntax highlighting.
            </div>
          </TabsContent>
          
          <TabsContent value="output" className="min-h-[300px]">
            <div className="border rounded-md p-4 bg-black text-green-400 font-mono h-[300px] overflow-auto whitespace-pre-wrap">
              {output || 'Run your code to see output here...'}
            </div>
          </TabsContent>
          
          <TabsContent value="tests" className="min-h-[300px]">
            <div className="border rounded-md p-4 h-[300px] overflow-auto">
              {testCases.length > 0 ? (
                <div className="space-y-4">
                  {testCases.map((testCase, index) => {
                    const testResult = testResults[index];
                    return (
                      <div key={index} className="border rounded-md p-3">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Test Case {index + 1}: {testCase.description}</h4>
                          {testResult && (
                            <Badge 
                              variant={testResult.passed ? "default" : "destructive"}
                              className={`${testResult.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                            >
                              {testResult.passed ? 'PASSED' : 'FAILED'}
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">Input:</span> {testCase.input}</p>
                          <p><span className="font-medium">Expected Output:</span> {testCase.expectedOutput}</p>
                          {testResult && (
                            <p><span className="font-medium">Actual Output:</span> {testResult.output}</p>
                          )}
                          {testResult && !testResult.passed && (
                            <p className="text-red-600">{testResult.message}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <p>No test cases available for this exercise.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="hints" className="min-h-[300px]">
            <div className="border rounded-md p-4 h-[300px] overflow-auto">
              {hints.length > 0 ? (
                <div className="space-y-4">
                  {hints.map((hint, index) => (
                    <div key={index} className="border rounded-md overflow-hidden">
                      <button
                        onClick={() => toggleHint(index)}
                        className="w-full p-3 text-left font-medium flex justify-between items-center hover:bg-gray-50"
                      >
                        <span>Hint {index + 1}</span>
                        <span>{visibleHints.includes(index) ? '−' : '+'}</span>
                      </button>
                      {visibleHints.includes(index) && (
                        <div className="p-3 border-t bg-blue-50">
                          {hint}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <p>No hints available for this exercise.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          {solution && (
            <TabsContent value="solution" className="min-h-[300px]">
              <div className="border rounded-md p-4 h-[300px] overflow-auto">
                {showSolution ? (
                  <pre className={`font-mono text-sm whitespace-pre-wrap ${getLanguageClass()}`}>
                    {solution}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Button onClick={toggleSolution}>Show Solution</Button>
                    <p className="mt-2 text-sm text-gray-500">
                      Try to solve the exercise on your own first!
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={runCode} 
            disabled={isRunning}
            className="mr-2"
          >
            {isRunning ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Run Code
          </Button>
        </motion.div>
        
        {testCases.length > 0 && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={runTests} 
              variant="secondary"
              disabled={isRunning}
              className="mr-2"
            >
              {isRunning ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Run Tests
            </Button>
          </motion.div>
        )}
        
        <Button 
          onClick={saveCode} 
          variant="outline"
          className="mr-2"
        >
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
        
        <Button 
          onClick={resetCode} 
          variant="outline"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset
        </Button>
        
        <div className="flex-1"></div>
        
        {solution && (
          <Button 
            onClick={toggleSolution} 
            variant="ghost"
          >
            <Lightbulb className="mr-2 h-4 w-4" />
            {showSolution ? 'Hide Solution' : 'Show Solution'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

// We'll add a Badge component since we're using it in the code but it's not imported
// In a real implementation, you'd import this from your UI component library
const Badge = ({ children, variant = 'default', className = '' }) => {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold';
  
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    destructive: 'bg-red-100 text-red-800',
    outline: 'border border-gray-200 text-gray-800'
  };
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default InteractiveCodingLab;