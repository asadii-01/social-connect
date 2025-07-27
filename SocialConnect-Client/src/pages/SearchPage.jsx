"use client"

import { useState, useEffect } from "react"
import { useLocation, Link } from "react-router-dom"
import { Search, Users, FileText, Loader2 } from "lucide-react"
import api from "../services/api"
import PostCard from "../components/PostCard"

function useQuery() {
  return new URLSearchParams(useLocation().search).get("q")
}

export default function SearchPage() {
  const query = useQuery()
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("users")

  useEffect(() => {
    if (!query) return

    const performSearch = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const [usersResponse, postsResponse] = await Promise.all([
          api.get(`/users/search?q=${encodeURIComponent(query)}`),
          api.get(`/posts/search?q=${encodeURIComponent(query)}`),
        ])

        setUsers(usersResponse.data)
        setPosts(postsResponse.data)
      } catch (error) {
        console.error("Search failed:", error)
        setError("Search failed. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    performSearch()
  }, [query])

  if (!query) {
    return (
      <main className="container mx-auto py-6 px-4 max-w-4xl">
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Search SocialConnect</h2>
          <p className="text-gray-600 dark:text-gray-400">Use the search bar above to find users and posts</p>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto py-6 px-4 max-w-4xl">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Search results for "{query}"</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Found {users.length} users and {posts.length} posts
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Searching...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Results */}
      {!isLoading && !error && (
        <>
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === "users"
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <Users className="w-4 h-4" />
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === "posts"
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <FileText className="w-4 h-4" />
              Posts ({posts.length})
            </button>
          </div>

          {/* Users Tab */}
          {activeTab === "users" && (
            <section>
              {users.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No users found</h3>
                  <p className="text-gray-600 dark:text-gray-400">Try searching with different keywords</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((user) => (
                    <Link
                      key={user._id}
                      to={`/profile/${user.username}`}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={user.avatarUrl || "/placeholder.jpg?height=48&width=48"}
                          alt={user.username}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700 group-hover:ring-blue-200 dark:group-hover:ring-blue-800 transition-all"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {user.name || user.username}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">@{user.username}</p>
                          {user.bio && (
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 line-clamp-2">{user.bio}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Posts Tab */}
          {activeTab === "posts" && (
            <section>
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No posts found</h3>
                  <p className="text-gray-600 dark:text-gray-400">Try searching with different keywords</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </main>
  )
}
