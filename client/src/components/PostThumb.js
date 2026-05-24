import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

const PostThumb = ({posts, result}) => {
    const { theme } = useSelector(state => state)

    if(result === 0) return <h2 className="text-center text-danger">No Post</h2>

    return (
        <div className="post_thumb">
            {
                posts.map(post => {
                    // Support both string URLs and {url: '...'} objects
                    const src = typeof post.images[0] === 'string' ? post.images[0] : post.images[0]?.url
                    if (!src) return null
                    const isVideo = src.match(/video/i)
                    return (
                        <Link key={post._id} to={`/post/${post._id}`}>
                            <div className="post_thumb_display">
                                {
                                    isVideo
                                    ? <video controls src={src} alt={src}
                                      style={{filter: theme ? 'invert(1)' : 'invert(0)'}} />
                                    : <img src={src} alt={src}
                                      style={{filter: theme ? 'invert(1)' : 'invert(0)'}} />
                                }
                                <div className="post_thumb_menu">
                                    <i className="far fa-heart">{post.likes.length}</i>
                                    <i className="far fa-comment">{post.comments.length}</i>
                                </div>
                            </div>
                        </Link>
                    )
                })
            }
        </div>
    )
}

export default PostThumb
