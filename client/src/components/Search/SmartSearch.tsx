import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaTimes, FaSpinner, FaLightbulb, FaHistory, FaUserGraduate } from 'react-icons/fa';
import { useDebounce } from '@/hooks/useDebounce';
import { apiRequest } from '@/lib/queryClient';

type SearchResult = {
  id: number | string;
  title: string;
  type: 'course' | 'article' | 'tool' | 'forum' | 'certificate';
  url: string;
  snippet?: string;
  relevance?: number;
};

type SearchSuggestion = {
  id: string;
  text: string;
  type: 'popular' | 'trending' | 'ai' | 'history';
};

// Create a custom hook for the search functionality
export const useSmartSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const debouncedQuery = useDebounce(query, 300);
  const searchRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('rxai_search_history');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory).slice(0, 5));
      } catch (e) {
        console.error('Error parsing search history', e);
      }
    }
  }, []);

  // Save search history to localStorage
  const saveToHistory = (term: string) => {
    if (!term.trim() || searchHistory.includes(term)) return;
    
    const newHistory = [term, ...searchHistory].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('rxai_search_history', JSON.stringify(newHistory));
  };

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch search results and suggestions when query changes
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        // In a real implementation, call your API
        const response = await apiRequest('GET', `/api/search?q=${encodeURIComponent(debouncedQuery)}`);
        const data = await response.json();
        setResults(data.results || []);
      } catch (error) {
        console.error('Error fetching search results:', error);
        // Use fallback results for demo
        setResults(getFallbackResults(debouncedQuery));
      } finally {
        setIsLoading(false);
      }
    };

    const fetchSuggestions = async () => {
      try {
        // In a real implementation, call your API
        const response = await apiRequest('GET', `/api/search/suggestions?q=${encodeURIComponent(debouncedQuery)}`);
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
        // Use fallback suggestions for demo
        setSuggestions(getFallbackSuggestions(debouncedQuery));
      }
    };

    if (debouncedQuery) {
      fetchResults();
      fetchSuggestions();
    } else {
      // When query is empty, show recent searches and trending topics
      const historySuggestions = searchHistory.map((term, index) => ({
        id: `history-${index}`,
        text: term,
        type: 'history' as const
      }));
      
      setSuggestions([
        ...historySuggestions,
        { id: 'trending-1', text: 'AI fundamentals course', type: 'trending' },
        { id: 'trending-2', text: 'Machine learning certification', type: 'trending' },
        { id: 'popular-1', text: 'Natural language processing', type: 'popular' },
        { id: 'popular-2', text: 'AI ethics guidelines', type: 'popular' }
      ]);
    }
  }, [debouncedQuery, searchHistory]);

  // Handle search submission
  const handleSearch = (searchTerm = query) => {
    if (!searchTerm.trim()) return;
    
    saveToHistory(searchTerm);
    setIsOpen(false);
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  return {
    query,
    setQuery,
    results,
    suggestions,
    isLoading,
    isOpen,
    setIsOpen,
    searchRef,
    handleSearch,
  };
};

// Fallback data for demo purposes
const getFallbackResults = (query: string): SearchResult[] => {
  return [
    {
      id: 1,
      title: `Introduction to AI: ${query}`,
      type: 'course',
      url: '/courses/intro-to-ai',
      snippet: `Learn the fundamentals of artificial intelligence with our comprehensive course covering ${query} and more.`
    },
    {
      id: 2,
      title: `Latest developments in ${query}`,
      type: 'article',
      url: '/articles/ai-latest-developments',
      snippet: `Stay up-to-date with the cutting-edge research and advancements in ${query} and related technologies.`
    },
    {
      id: 3,
      title: `${query} Implementation Strategies`,
      type: 'forum',
      url: '/forum/ai-implementation',
      snippet: `Community discussion on best practices for implementing ${query} in various business contexts.`
    }
  ];
};

const getFallbackSuggestions = (query: string): SearchSuggestion[] => {
  return [
    { id: 'ai-1', text: `${query} fundamentals`, type: 'ai' as const },
    { id: 'ai-2', text: `Advanced ${query} techniques`, type: 'ai' as const },
    { id: 'ai-3', text: `${query} for beginners`, type: 'ai' as const },
    { id: 'trending-1', text: `${query} certification`, type: 'trending' as const }
  ];
};

// Main search component
export default function SmartSearch() {
  const [, navigate] = useLocation();
  const {
    query,
    setQuery,
    results,
    suggestions,
    isLoading,
    isOpen,
    setIsOpen,
    searchRef,
    handleSearch
  } = useSmartSearch();

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    handleSearch(suggestion.text);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
  };

  // Render icon based on suggestion type
  const renderSuggestionIcon = (type: string) => {
    switch (type) {
      case 'history':
        return <FaHistory className="text-gray-400" />;
      case 'trending':
        return <FaSpinner className="text-orange-500" />;
      case 'popular':
        return <FaSearch className="text-blue-500" />;
      case 'ai':
        return <FaLightbulb className="text-yellow-500" />;
      default:
        return <FaSearch className="text-gray-400" />;
    }
  };

  return (
    <div ref={searchRef} className="relative">
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="Search courses, articles, tools..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-[#0066cc] transition-all duration-300 bg-white shadow-sm"
            aria-label="Search"
          />
          
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-4 w-4 text-gray-400" />
          </div>
          
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              aria-label="Clear search"
            >
              <FaTimes className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </form>

      {/* Search dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden max-h-[70vh] overflow-y-auto"
            style={{ minWidth: '300px' }}
          >
            {isLoading ? (
              <div className="p-4 flex items-center justify-center">
                <FaSpinner className="animate-spin h-5 w-5 text-[#0066cc] mr-2" />
                <span>Searching...</span>
              </div>
            ) : (
              <div>
                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="p-3 border-b border-gray-100">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Suggestions
                    </h3>
                    <ul>
                      {suggestions.map((suggestion) => (
                        <li key={suggestion.id}>
                          <button
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded-md flex items-center transition-colors"
                          >
                            <span className="mr-2">
                              {renderSuggestionIcon(suggestion.type)}
                            </span>
                            <span>{suggestion.text}</span>
                            {suggestion.type === 'trending' && (
                              <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                                Trending
                              </span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Results */}
                {results.length > 0 && (
                  <div className="p-3">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Results
                    </h3>
                    <ul className="space-y-3">
                      {results.map((result) => (
                        <li key={result.id} className="border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                          <a
                            href={result.url}
                            className="block hover:bg-blue-50 rounded-md p-2 transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0 mr-3 mt-1">
                                {result.type === 'course' && (
                                  <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <FaUserGraduate className="h-4 w-4 text-blue-600" />
                                  </span>
                                )}
                                {result.type === 'article' && (
                                  <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                    <FaLightbulb className="h-4 w-4 text-green-600" />
                                  </span>
                                )}
                                {result.type === 'forum' && (
                                  <span className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                                    <FaLightbulb className="h-4 w-4 text-yellow-600" />
                                  </span>
                                )}
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">{result.title}</h4>
                                <p className="mt-1 text-xs text-gray-500 line-clamp-2">{result.snippet}</p>
                                <span className="mt-1 inline-block px-2 py-0.5 text-[10px] font-medium rounded bg-gray-100 text-gray-800">
                                  {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                                </span>
                              </div>
                            </div>
                          </a>
                        </li>
                      ))}
                    </ul>
                    {query && (
                      <div className="mt-3 text-center">
                        <a
                          href={`/search?q=${encodeURIComponent(query)}`}
                          className="text-sm text-[#0066cc] hover:text-[#0055b3] font-medium"
                          onClick={() => setIsOpen(false)}
                        >
                          See all results for "{query}"
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* No results */}
                {query && !isLoading && results.length === 0 && suggestions.length === 0 && (
                  <div className="p-4 text-center">
                    <p className="text-gray-500">No results found for "{query}"</p>
                    <p className="text-sm text-gray-400 mt-1">Try different keywords or browse our courses</p>
                  </div>
                )}

                {/* Empty state */}
                {!query && suggestions.length === 0 && (
                  <div className="p-4 text-center">
                    <p className="text-gray-500">Start typing to search</p>
                    <p className="text-sm text-gray-400 mt-1">Search for courses, articles, tools, and more</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}