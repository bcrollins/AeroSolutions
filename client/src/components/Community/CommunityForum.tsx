import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaComment, 
  FaUser, 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaHeart, 
  FaClock, 
  FaTag, 
  FaChevronDown, 
  FaCertificate, 
  FaUserGraduate, 
  FaComments, 
  FaPencilAlt, 
  FaPlus, 
  FaStar
} from 'react-icons/fa';
import { useNotification } from '@/components/UI/NotificationSystem';
import { MicroInteractions } from '@/components/UI/NotificationSystem';
import { useDebounce } from '@/hooks/useDebounce';

interface ForumUser {
  id: string;
  username: string;
  avatarUrl?: string;
  reputation: number;
  isModerator?: boolean;
  isInstructor?: boolean;
  joinDate: string;
  postCount: number;
  badges: string[];
}

interface ForumTopic {
  id: string;
  title: string;
  previewText: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  commentCount: number;
  isPinned?: boolean;
  isAnnouncement?: boolean;
  isSolved?: boolean;
  author: ForumUser;
  lastReplier?: ForumUser;
}

interface ForumComment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  likes: number;
  isAcceptedAnswer?: boolean;
  author: ForumUser;
  parentId?: string;
  replies?: ForumComment[];
}

interface ForumCategoryProps {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  topicCount: number;
  lastActivity?: {
    topicTitle: string;
    topicId: string;
    timestamp: string;
    user: ForumUser;
  };
}

interface CommunityForumProps {
  categories: ForumCategoryProps[];
  featuredTopics: ForumTopic[];
  recentTopics: ForumTopic[];
  popularTopics: ForumTopic[];
  onCategorySelect?: (categoryId: string) => void;
  onTopicSelect?: (topicId: string) => void;
  onCreateTopic?: () => void;
  onSearch?: (query: string) => void;
  currentUser?: ForumUser;
}

export default function CommunityForum({
  categories,
  featuredTopics = [],
  recentTopics = [],
  popularTopics = [],
  onCategorySelect,
  onTopicSelect,
  onCreateTopic,
  onSearch,
  currentUser
}: CommunityForumProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'featured' | 'recent' | 'popular'>('featured');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { showNotification } = useNotification();
  
  // Extract all unique tags from topics
  useEffect(() => {
    const allTopics = [...featuredTopics, ...recentTopics, ...popularTopics];
    const tagSet = new Set<string>();
    
    allTopics.forEach(topic => {
      topic.tags.forEach(tag => tagSet.add(tag));
    });
    
    setAvailableTags(Array.from(tagSet).sort());
  }, [featuredTopics, recentTopics, popularTopics]);
  
  // Handle search query changes
  useEffect(() => {
    if (debouncedSearchQuery && onSearch) {
      onSearch(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, onSearch]);
  
  // Handle tag selection
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Get relative time
  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMilliseconds = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInMinutes < 60) {
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    } else {
      return formatDate(dateString);
    }
  };
  
  // Filter topics based on selected tags
  const filterTopicsByTags = (topics: ForumTopic[]): ForumTopic[] => {
    if (selectedTags.length === 0) return topics;
    
    return topics.filter(topic => {
      return selectedTags.some(tag => topic.tags.includes(tag));
    });
  };
  
  // Get the active topics based on the current tab
  const getActiveTopics = (): ForumTopic[] => {
    switch (activeTab) {
      case 'featured':
        return filterTopicsByTags(featuredTopics);
      case 'recent':
        return filterTopicsByTags(recentTopics);
      case 'popular':
        return filterTopicsByTags(popularTopics);
      default:
        return filterTopicsByTags(featuredTopics);
    }
  };
  
  const activeTopics = getActiveTopics();
  
  // Handle topic click
  const handleTopicClick = (topicId: string) => {
    if (onTopicSelect) {
      onTopicSelect(topicId);
    }
  };
  
  // Handle category click
  const handleCategoryClick = (categoryId: string) => {
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    }
  };
  
  // Handle new topic
  const handleNewTopic = () => {
    if (currentUser) {
      if (onCreateTopic) {
        onCreateTopic();
      }
    } else {
      showNotification({
        title: 'Login Required',
        message: 'You need to be logged in to create a new topic.',
        type: 'info'
      });
    }
  };
  
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Forum Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">RXAI Community Forum</h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-blue-100">
              Connect with fellow learners, share knowledge, and solve challenges together
            </p>
          </div>
          
          {/* Search and Add Topic */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <div className="relative flex-1 max-w-2xl mx-auto sm:mx-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, questions, or keywords..."
                className="block w-full bg-white bg-opacity-90 border border-transparent rounded-lg py-3 pl-10 pr-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
              />
            </div>
            
            <MicroInteractions.HoverScale className="sm:ml-4">
              <button
                onClick={handleNewTopic}
                className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-800 hover:bg-blue-900 shadow-sm"
              >
                <FaPlus className="mr-2" />
                New Topic
              </button>
            </MicroInteractions.HoverScale>
          </div>
        </div>
      </div>
      
      {/* Forum Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Categories */}
          <div className="lg:col-span-1 space-y-6">
            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <div 
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                          {category.icon}
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-base font-medium text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                        <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                          <span>{category.topicCount} topics</span>
                          {category.lastActivity && (
                            <span>Last post {getRelativeTime(category.lastActivity.timestamp)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Tags Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div 
                className="px-6 py-4 border-b border-gray-200 flex justify-between items-center cursor-pointer"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <h2 className="text-lg font-semibold text-gray-900">Filter by Tags</h2>
                <FaChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${filterOpen ? 'transform rotate-180' : ''}`} />
              </div>
              
              {filterOpen && (
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          selectedTags.includes(tag)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  
                  {selectedTags.length > 0 && (
                    <div className="mt-4 text-right">
                      <button
                        onClick={() => setSelectedTags([])}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Clear all filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* User Stats (if logged in) */}
            {currentUser && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">My Activity</h2>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="relative">
                      <img 
                        src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username)}&background=0066cc&color=fff`}
                        alt={currentUser.username}
                        className="h-14 w-14 rounded-full object-cover border-2 border-blue-100"
                      />
                      {currentUser.isInstructor && (
                        <div className="absolute -top-1 -right-1 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white">
                          <FaUserGraduate className="h-3 w-3 text-blue-600" />
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      <h3 className="text-base font-medium text-gray-900">
                        {currentUser.username}
                        {currentUser.isModerator && (
                          <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                            Moderator
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">Member since {formatDate(currentUser.joinDate)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-semibold text-gray-900">{currentUser.reputation}</div>
                      <div className="text-xs text-gray-500">Reputation</div>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-gray-900">{currentUser.postCount}</div>
                      <div className="text-xs text-gray-500">Posts</div>
                    </div>
                    <div>
                      <div className="text-2xl font-semibold text-gray-900">{currentUser.badges.length}</div>
                      <div className="text-xs text-gray-500">Badges</div>
                    </div>
                  </div>
                  
                  {currentUser.badges.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Badges</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentUser.badges.slice(0, 5).map((badge, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800"
                          >
                            <FaCertificate className="mr-1 h-3 w-3 text-yellow-500" />
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - Topics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('featured')}
                    className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                      activeTab === 'featured'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Featured Topics
                  </button>
                  <button
                    onClick={() => setActiveTab('recent')}
                    className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                      activeTab === 'recent'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Recent Activity
                  </button>
                  <button
                    onClick={() => setActiveTab('popular')}
                    className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                      activeTab === 'popular'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Popular
                  </button>
                </nav>
              </div>
              
              <div className="divide-y divide-gray-200">
                {activeTopics.length > 0 ? (
                  activeTopics.map((topic) => (
                    <MicroInteractions.HoverScale 
                      key={topic.id} 
                      scale={1.01}
                      className="px-6 py-5 cursor-pointer"
                      onClick={() => handleTopicClick(topic.id)}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <img 
                            src={topic.author.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(topic.author.username)}&background=0066cc&color=fff`}
                            alt={topic.author.username}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="text-base font-medium text-gray-900 group-hover:text-blue-600 pr-8">
                              {topic.isPinned && (
                                <span className="mr-2 text-yellow-500">📌</span>
                              )}
                              {topic.isAnnouncement && (
                                <span className="mr-2 text-red-500">📢</span>
                              )}
                              {topic.title}
                              {topic.isSolved && (
                                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                  Solved
                                </span>
                              )}
                            </h3>
                            <span className="text-xs text-gray-500">{getRelativeTime(topic.updatedAt)}</span>
                          </div>
                          
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{topic.previewText}</p>
                          
                          <div className="mt-2 flex flex-wrap gap-2">
                            {topic.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                <FaTag className="mr-1 h-3 w-3" />
                                {tag}
                              </span>
                            ))}
                          </div>
                          
                          <div className="mt-3 flex justify-between items-center">
                            <div className="flex items-center text-xs text-gray-500">
                              <span className="flex items-center mr-4">
                                <FaEye className="mr-1 h-3 w-3" />
                                {topic.views}
                              </span>
                              <span className="flex items-center mr-4">
                                <FaHeart className="mr-1 h-3 w-3" />
                                {topic.likes}
                              </span>
                              <span className="flex items-center">
                                <FaComment className="mr-1 h-3 w-3" />
                                {topic.commentCount}
                              </span>
                            </div>
                            
                            {topic.lastReplier && (
                              <div className="flex items-center text-xs">
                                <span className="text-gray-500 mr-2">Last reply by</span>
                                <img
                                  src={topic.lastReplier.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(topic.lastReplier.username)}&background=0066cc&color=fff`}
                                  alt={topic.lastReplier.username}
                                  className="h-5 w-5 rounded-full mr-1"
                                />
                                <span className="font-medium text-gray-700">{topic.lastReplier.username}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </MicroInteractions.HoverScale>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <FaComments className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-base font-medium text-gray-900">No topics found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedTags.length > 0
                        ? "No topics match your selected tags. Try removing some filters."
                        : searchQuery
                          ? "No topics found for your search query."
                          : "Be the first to start a discussion in this category."}
                    </p>
                    
                    <div className="mt-6">
                      <button
                        onClick={handleNewTopic}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FaPencilAlt className="mr-2 -ml-1 h-4 w-4" />
                        Create a new topic
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Pagination */}
              {activeTopics.length > 10 && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                    <span className="font-medium">{activeTopics.length}</span> topics
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-500 bg-white hover:bg-gray-50">
                      Previous
                    </button>
                    <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-500 bg-white hover:bg-gray-50">
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Community Guidelines */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-3">Community Guidelines</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <FaStar className="h-4 w-4 mt-0.5 mr-2 text-blue-600" />
                  Be respectful and supportive of fellow learners
                </li>
                <li className="flex items-start">
                  <FaStar className="h-4 w-4 mt-0.5 mr-2 text-blue-600" />
                  Share your knowledge and experiences to help others
                </li>
                <li className="flex items-start">
                  <FaStar className="h-4 w-4 mt-0.5 mr-2 text-blue-600" />
                  Keep discussions relevant to AI learning and technology
                </li>
                <li className="flex items-start">
                  <FaStar className="h-4 w-4 mt-0.5 mr-2 text-blue-600" />
                  Provide constructive feedback and detailed questions
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}