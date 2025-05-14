import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ToolLayout from '@/components/tools/ToolLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Code, Copy, Check, Wand2, Terminal, Bug, Sparkles } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

// Tutorial content for the Code Assistant tool
const CodeAssistantTutorial = (
  <div className="space-y-4">
    <p>The Code Assistant helps you write better code faster. Here's how to use it:</p>
    <ol className="list-decimal list-inside space-y-2">
      <li>Choose your programming language</li>
      <li>Describe what you want to create or paste code to debug</li>
      <li>Add any specific requirements or constraints</li>
      <li>Click "Generate" to get code or "Debug" for issue detection</li>
      <li>Review, test, and refine as needed</li>
    </ol>
    <p className="text-muted-foreground">For best results, be as specific as possible in your descriptions!</p>
    
    <div className="bg-muted p-4 rounded-md mt-4">
      <h4 className="font-medium mb-2">Pro Tips:</h4>
      <ul className="list-disc list-inside space-y-1">
        <li>Use "Optimize" to make existing code more efficient</li>
        <li>Try "Explain" to get a line-by-line breakdown of complex code</li>
        <li>Generate unit tests for your functions automatically</li>
        <li>Convert code between different programming languages</li>
      </ul>
    </div>
  </div>
);

const CodeAssistantPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('generate');
  const [language, setLanguage] = useState('javascript');
  const [description, setDescription] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [functionName, setFunctionName] = useState('');
  const [requirements, setRequirements] = useState('');

  const handleProcessAction = async () => {
    if (
      (activeTab === 'generate' && !description) || 
      ((activeTab === 'debug' || activeTab === 'optimize' || activeTab === 'explain') && !codeInput)
    ) {
      toast({
        title: "Input Required",
        description: activeTab === 'generate' 
          ? "Please enter a description of what you want to generate." 
          : "Please paste the code you want to process.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    trackEvent('code_assistant_action', 'code_assistant', activeTab);

    try {
      // In a real implementation, this would call the OpenAI API
      // For this demo, we'll simulate a delay and return placeholder content
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Placeholders based on action type
      let placeholderResult = '';
      
      if (activeTab === 'generate') {
        if (language === 'javascript') {
          placeholderResult = `/**
 * ${functionName || 'Untitled Function'}
 * ${description}
 * 
 * @returns {Promise<Object>} The processed result
 */
async function ${functionName || 'processData'}(input) {
  try {
    // Validate input
    if (!input || typeof input !== 'object') {
      throw new Error('Invalid input provided');
    }
    
    // Process the data according to requirements
    const result = await fetch('https://api.example.com/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    
    const data = await result.json();
    
    // Transform the response
    const transformedData = {
      id: data.id,
      timestamp: new Date().toISOString(),
      results: data.results.map(item => ({
        ...item,
        score: item.value * 100,
        status: item.value > 0.5 ? 'passed' : 'failed',
      })),
      summary: {
        total: data.results.length,
        passed: data.results.filter(item => item.value > 0.5).length,
        failed: data.results.filter(item => item.value <= 0.5).length,
      }
    };
    
    return transformedData;
  } catch (error) {
    console.error('Error processing data:', error);
    throw error;
  }
}`;
        } else if (language === 'python') {
          placeholderResult = `import requests
import json
from datetime import datetime
from typing import Dict, List, Any, Optional

def ${functionName || 'process_data'}(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    ${description}
    
    Args:
        input_data: The input data to process
        
    Returns:
        Dict[str, Any]: The processed result
    
    Raises:
        ValueError: If the input is invalid
    """
    # Validate input
    if not isinstance(input_data, dict):
        raise ValueError("Invalid input provided")
    
    # Process the data according to requirements
    response = requests.post(
        "https://api.example.com/process",
        headers={"Content-Type": "application/json"},
        data=json.dumps(input_data)
    )
    
    # Raise an exception for HTTP errors
    response.raise_for_status()
    
    # Parse the response
    data = response.json()
    
    # Transform the response
    transformed_data = {
        "id": data["id"],
        "timestamp": datetime.now().isoformat(),
        "results": [
            {
                **item,
                "score": item["value"] * 100,
                "status": "passed" if item["value"] > 0.5 else "failed",
            }
            for item in data["results"]
        ],
        "summary": {
            "total": len(data["results"]),
            "passed": len([item for item in data["results"] if item["value"] > 0.5]),
            "failed": len([item for item in data["results"] if item["value"] <= 0.5]),
        }
    }
    
    return transformed_data`;
        }
      } else if (activeTab === 'debug') {
        placeholderResult = `// Code Analysis Report
// ------------------

// ISSUES FOUND:
// 1. Potential Uncaught Promise Rejection
//    Line 7: Missing error handling for fetch operation
//    Recommendation: Add try/catch block or .catch() handler

// 2. Data Type Vulnerability
//    Line 15: Assuming response.json() will succeed without checking status code
//    Recommendation: Check response.ok before parsing JSON

// 3. Memory Leak
//    Line 29: Event listener not properly removed
//    Recommendation: Store reference to callback and use it in removeEventListener

// 4. Variable Scope Issue
//    Line 38: Using "i" from outer scope inside setTimeout creates closure issues
//    Recommendation: Use let instead of var, or create local binding

// 5. Security Risk
//    Line 42: Using eval() can execute arbitrary code
//    Recommendation: Replace with safer alternative

// SUGGESTED FIX:
${codeInput.substring(0, 100)}
// ...

// CORRECTED CODE:
try {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(\`HTTP error! Status: \${response.status}\`);
  }
  
  const data = await response.json();
  
  // ... rest of implementation with fixes ...
} catch (error) {
  console.error("Error fetching data:", error);
  // Handle error appropriately
}`;
      } else if (activeTab === 'optimize') {
        placeholderResult = `// OPTIMIZATION RESULTS
// -------------------

// BEFORE:
// Time Complexity: O(n²)
// Space Complexity: O(n)
// Performance Issues: 3 identified

// AFTER:
// Time Complexity: O(n log n)
// Space Complexity: O(1)
// Performance Improvement: ~68%

// OPTIMIZED CODE:
// --------------

const ${functionName || 'processData'} = (items) => {
  // Use Map for O(1) lookups instead of nested loops
  const lookup = new Map();
  
  // Pre-process data in a single pass
  items.forEach(item => {
    lookup.set(item.id, item);
  });
  
  // Replace sort+filter with a more efficient approach
  return Object.values(lookup)
    .filter(item => item.value > 0)
    .sort((a, b) => a.timestamp - b.timestamp);
};

// RECOMMENDATIONS:
// 1. Use memoization for repeated calculations
// 2. Replace array.reduce with direct loop for better performance
// 3. Consider using a Web Worker for CPU-intensive operations
// 4. Implement pagination for large datasets`;
      } else if (activeTab === 'explain') {
        placeholderResult = `// CODE EXPLANATION
// ----------------

// Line-by-line analysis:

// Line 1: Function declaration with async keyword
// - This creates an asynchronous function that returns a Promise
// - Allows the use of await inside the function body

// Line 2-4: Input validation
// - Checks if input exists and is an object
// - Throws an error with descriptive message if validation fails
// - This is a good defensive programming practice

// Line 7-13: API request using fetch
// - Makes a POST request to an external API
// - Sets the content type header to JSON
// - Converts the input object to a JSON string
// - Uses await to handle the Promise returned by fetch

// Line 15: JSON parsing
// - Extracts JSON data from the response
// - Uses await since response.json() returns a Promise

// Line 18-29: Data transformation
// - Creates a new object with modified structure
// - Uses array.map() to transform each item in results
// - Calculates derived values (score, status)
// - Generates summary statistics

// Line 31: Return statement
// - Returns the transformed data to the caller

// Error Handling:
// - The try/catch block encapsulates all operations
// - Any errors are logged and re-thrown
// - This ensures errors are visible but don't crash the application`;
      }
      
      setResult(placeholderResult);
    } catch (error) {
      console.error("Error processing code:", error);
      toast({
        title: "Processing Failed",
        description: "An error occurred while processing your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    
    trackEvent('copy_code', 'code_assistant', activeTab);
    
    toast({
      title: "Code Copied",
      description: "The generated code has been copied to your clipboard.",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  // Map action to icon
  const getActionIcon = () => {
    switch (activeTab) {
      case 'generate': return <Wand2 className="mr-2 h-4 w-4" />;
      case 'debug': return <Bug className="mr-2 h-4 w-4" />;
      case 'optimize': return <Sparkles className="mr-2 h-4 w-4" />;
      case 'explain': return <Terminal className="mr-2 h-4 w-4" />;
      default: return <Wand2 className="mr-2 h-4 w-4" />;
    }
  };

  // Map action to text
  const getActionText = () => {
    switch (activeTab) {
      case 'generate': return 'Generate Code';
      case 'debug': return 'Debug Code';
      case 'optimize': return 'Optimize Code';
      case 'explain': return 'Explain Code';
      default: return 'Process';
    }
  };

  return (
    <ToolLayout
      title="Code Assistant"
      description="Generate, debug, and optimize code snippets in Python, JavaScript, and other popular languages."
      tutorial={CodeAssistantTutorial}
      tutorialTitle="Code Assistant Fundamentals"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="debug">Debug</TabsTrigger>
          <TabsTrigger value="optimize">Optimize</TabsTrigger>
          <TabsTrigger value="explain">Explain</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {activeTab === 'generate' ? (
                <>
                  <div>
                    <Label htmlFor="language">Programming Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="typescript">TypeScript</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="csharp">C#</SelectItem>
                        <SelectItem value="php">PHP</SelectItem>
                        <SelectItem value="go">Go</SelectItem>
                        <SelectItem value="ruby">Ruby</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="function-name">Function Name (Optional)</Label>
                    <Input 
                      id="function-name" 
                      placeholder="e.g. processData, calculateTotal" 
                      value={functionName}
                      onChange={(e) => setFunctionName(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Describe what you want the code to do..." 
                      className="min-h-[100px]"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="requirements">Requirements (Optional)</Label>
                    <Textarea 
                      id="requirements" 
                      placeholder="Any specific requirements or constraints..." 
                      className="min-h-[80px]"
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <div>
                  <Label htmlFor="code-input">Paste Your Code</Label>
                  <Textarea 
                    id="code-input" 
                    placeholder={`// Paste your ${language} code here...`} 
                    className="min-h-[250px] font-mono text-sm"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                  />
                </div>
              )}
              
              <Button
                className="w-full mt-4"
                onClick={handleProcessAction}
                disabled={isProcessing || (activeTab === 'generate' && !description) || ((activeTab === 'debug' || activeTab === 'optimize' || activeTab === 'explain') && !codeInput)}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Processing...
                  </>
                ) : (
                  <>
                    {getActionIcon()}
                    {getActionText()}
                  </>
                )}
              </Button>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="result">Result</Label>
                {result && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    disabled={copied}
                  >
                    {copied ? (
                      <>
                        <Check className="mr-1 h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                )}
              </div>
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <Textarea
                    id="result"
                    className="min-h-[350px] font-mono text-sm border-0 rounded-none"
                    placeholder={`// ${getActionText()} result will appear here...`}
                    value={result}
                    readOnly
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Tabs>
    </ToolLayout>
  );
};

export default CodeAssistantPage;