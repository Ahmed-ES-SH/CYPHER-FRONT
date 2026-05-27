/* eslint-disable react/no-unescaped-entities */
"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  FaHeart,
  FaShare,
  FaBookmark,
  FaComment,
  FaStar,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaMobile,
  FaExclamationTriangle,
  FaArrowLeft,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { MdSmartDisplay } from "react-icons/md";
import Img from "@/app/_components/_global/Img";
import { ArticleType } from "@/app/_components/_website/_blog/ArticleCard";
import { useParams } from "next/navigation";
import { useBlogPost, blogToLegacyArticle } from "@/src/modules/blog";
import Link from "next/link";

const COMMENT_MAX_LENGTH = 500;

interface CommentEntry {
  id: string;
  author: string;
  avatarGradient: string;
  text: string;
  timestamp: string;
}

interface ArticleFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

// Placeholder article body for when API is not yet connected
const getPlaceholderContent = (
  article: ArticleType,
): { features: ArticleFeature[]; body: string; ctaItems: string[] } => {
  const lowerTitle = article.title.toLowerCase();

  if (lowerTitle.includes("sony") || lowerTitle.includes("xperia")) {
    return {
      features: [
        {
          icon: <MdSmartDisplay className="text-3xl mr-3" />,
          title: "True 4K OLED Display",
          description:
            "Experience unprecedented visual clarity with Sony's 6.5-inch 4K OLED display, offering true-to-life colors and HDR support for professional content review.",
        },
        {
          icon: <FaMobile className="text-3xl mr-3" />,
          title: "Creator-Focused Design",
          description:
            "Built for content creators with dedicated shutter button, advanced heat dissipation, and robust build quality for professional use.",
        },
        {
          icon: <FaStar className="text-3xl mr-3" />,
          title: "S-Cinetone Profiles",
          description:
            "Capture cinematic footage with professional S-Cinetone color profiles, bringing Hollywood-grade color science to your mobile productions.",
        },
        {
          icon: <FaComment className="text-3xl mr-3" />,
          title: "Real-time Tracking AF",
          description:
            "Never miss a shot with advanced real-time tracking autofocus that locks onto subjects with precision.",
        },
      ],
      body: `Sony's latest flagship, the Xperia 1 V, represents a significant leap forward in mobile technology specifically designed for content creators. With its stunning 4K OLED display and professional-grade camera capabilities, this device bridges the gap between smartphone convenience and professional creative tools.

The Xperia 1 V's design philosophy centers around empowering creators with tools that were previously exclusive to professional equipment. The device features a dedicated shutter button for tactile control, advanced heat dissipation for extended recording sessions, and a robust build quality that can withstand the demands of professional use.

With the Xperia 1 V, Sony has created more than just a smartphone — it's a comprehensive creative platform that understands the unique needs of modern content creators.`,
      ctaItems: [
        "21:9 CinemaWide display for immersive content viewing and editing",
        "120Hz refresh rate with variable refresh rate technology",
        "Professional video recording up to 4K 120fps",
        "Advanced image stabilization for smooth handheld footage",
        "Content creator apps pre-installed and optimized",
      ],
    };
  }

  // Generic fallback for all other articles
  return {
    features: [
      {
        icon: <MdSmartDisplay className="text-3xl mr-3" />,
        title: "Cutting-Edge Technology",
        description:
          "This device showcases the latest advancements in mobile technology, pushing the boundaries of what's possible in a compact form factor.",
      },
      {
        icon: <FaMobile className="text-3xl mr-3" />,
        title: "Premium Build Quality",
        description:
          "Crafted with premium materials and meticulous attention to detail, this device delivers a flagship experience that feels solid and refined.",
      },
      {
        icon: <FaStar className="text-3xl mr-3" />,
        title: "Exceptional Performance",
        description:
          "Powered by the latest generation chipset, delivering smooth performance for demanding tasks and everyday use alike.",
      },
      {
        icon: <FaComment className="text-3xl mr-3" />,
        title: "Versatile Camera System",
        description:
          "A comprehensive camera setup that adapts to any scenario, from wide-angle landscapes to detailed macro shots.",
      },
    ],
    body: `This latest release represents a significant step forward in mobile technology. With its refined design, powerful internals, and thoughtful feature set, it addresses the needs of both everyday users and enthusiasts.

The design philosophy centers around delivering a premium experience without compromise. Every component has been carefully selected and optimized to work together seamlessly, from the display to the processor to the camera system.

Full detailed review and hands-on content will be available soon as we continue testing this device in real-world scenarios.`,
    ctaItems: [
      "Latest generation processor for blazing-fast performance",
      "All-day battery life with fast charging support",
      "Premium display with high refresh rate and HDR support",
      "Advanced camera system with AI-enhanced photography",
      "5G connectivity for future-proof networking",
    ],
  };
};

// Sample comments per article (will be replaced with API data)
const getSampleComments = (articleId: number | string): CommentEntry[] => {
  const commentsMap: Record<string | number, CommentEntry[]> = {
    1: [
      {
        id: "c1",
        author: "TechFan42",
        avatarGradient: "from-blue-500 to-cyan-500",
        text: "Finally USB-C! This should have happened years ago. The titanium body is a nice touch too — hopefully it makes the phone more durable.",
        timestamp: "2 hours ago",
      },
      {
        id: "c2",
        author: "Sarah J.",
        avatarGradient: "from-cyan-500 to-blue-500",
        text: "The A17 Pro chip benchmarks are impressive. Wonder how the thermal performance compares to the iPhone 14 Pro.",
        timestamp: "5 hours ago",
      },
    ],
    7: [
      {
        id: "c3",
        author: "Alex Chen",
        avatarGradient: "from-blue-500 to-cyan-500",
        text: "Amazing review! I've been using the Xperia 1 V for my YouTube channel and the 4K display is absolutely game-changing.",
        timestamp: "2 hours ago",
      },
      {
        id: "c4",
        author: "Sarah Johnson",
        avatarGradient: "from-cyan-500 to-blue-500",
        text: "As a professional photographer, I'm impressed by the real-time tracking autofocus. It rivals some of my dedicated camera equipment.",
        timestamp: "5 hours ago",
      },
      {
        id: "c5",
        author: "Mike Rodriguez",
        avatarGradient: "from-blue-500 to-cyan-500",
        text: "The battery life during extended 4K recording sessions is impressive. Finally, a phone that can keep up with my creative workflow!",
        timestamp: "1 day ago",
      },
    ],
  };
  return commentsMap[articleId] || [];
};

// Skeleton loading component
function ArticleSkeleton() {
  return (
    <div className="xl:flex-1/2 w-full bg-surface py-8 px-4">
      <div className="bg-white rounded-md shadow-lg overflow-hidden w-full">
        {/* Header skeleton */}
        <div className="p-8">
          <div className="flex gap-2 mb-4">
            <div className="bg-border-subtle rounded-full h-7 w-24 animate-pulse" />
            <div className="bg-border-subtle rounded-full h-6 w-16 animate-pulse" />
          </div>
          <div className="bg-border-subtle rounded h-10 w-3/4 mb-4 animate-pulse" />
          <div className="bg-border-subtle rounded h-5 w-full mb-2 animate-pulse" />
          <div className="bg-border-subtle rounded h-5 w-2/3 animate-pulse" />
          <div className="flex gap-6 mt-6">
            <div className="bg-border-subtle rounded h-5 w-28 animate-pulse" />
            <div className="bg-border-subtle rounded h-5 w-24 animate-pulse" />
            <div className="bg-border-subtle rounded h-5 w-24 animate-pulse" />
          </div>
        </div>
        {/* Image skeleton */}
        <div className="bg-border-subtle h-80 w-full animate-pulse" />
        {/* Content skeleton */}
        <div className="p-8">
          <div className="space-y-3">
            <div className="bg-border-subtle rounded h-4 w-full animate-pulse" />
            <div className="bg-border-subtle rounded h-4 w-5/6 animate-pulse" />
            <div className="bg-border-subtle rounded h-4 w-4/6 animate-pulse" />
          </div>
          <div className="grid md:grid-cols-2 gap-6 my-8">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-surface rounded-md p-6 border border-border-subtle"
              >
                <div className="bg-border-subtle rounded h-5 w-1/2 mb-3 animate-pulse" />
                <div className="bg-border-subtle rounded h-4 w-full animate-pulse" />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <div className="bg-border-subtle rounded h-4 w-full animate-pulse" />
            <div className="bg-border-subtle rounded h-4 w-3/4 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Article not found component
function ArticleNotFound() {
  return (
    <div className="xl:flex-1/2 w-full bg-surface py-8 px-4 flex items-center justify-center">
      <div className="bg-white rounded-md shadow-lg p-12 max-w-lg w-full text-center border border-border-subtle">
        <FaExclamationTriangle className="mx-auto text-6xl mb-6 text-primary-yellow" />
        <h2 className="text-3xl font-bold mb-4 text-dark-btn">
          Article Not Found
        </h2>
        <p className="text-text-secondary mb-8 leading-relaxed">
          The article you&apos;re looking for doesn&apos;t exist or may have been
          removed. Please check the URL or browse our blog to find other great
          content.
        </p>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 bg-primary-blue text-white px-6 py-3 rounded-full hover:bg-dark-btn transition-colors font-medium"
        >
          <FaArrowLeft />
          Back to Blog
        </Link>
      </div>
    </div>
  );
}

export default function ArticleComponent() {
  const params = useParams();
  const shouldReduceMotion = useReducedMotion();

  const slug =
    typeof params?.articleTitle === "string" ? params.articleTitle : "";

  const {
    data: blogArticle,
    isLoading,
    error: articleError,
  } = useBlogPost(slug || undefined);

  const [article, setArticle] = useState<ArticleType | null>(null);
  const [content, setContent] = useState<{
    features: ArticleFeature[];
    body: string;
    ctaItems: string[];
  } | null>(null);

  // Engagement state
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likes, setLikes] = useState(128);
  const [isLiked, setIsLiked] = useState(false);

  // Comment state
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<CommentEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Load article from blog module
  useEffect(() => {
    if (!blogArticle) return;

    const legacy = blogToLegacyArticle(blogArticle);
    setArticle(legacy);

    const bodyContent = getPlaceholderContent(legacy);
    setContent(bodyContent);

    setComments(getSampleComments(legacy.id));
    setLikes(Math.floor(Math.random() * 200) + 50);

    // Use article content from API when available
    if (blogArticle.content) {
      setContent((prev) =>
        prev
          ? {
              ...prev,
              body: blogArticle.content,
            }
          : prev,
      );
    }
  }, [blogArticle]);

  // Like handler
  const handleLike = useCallback(() => {
    setIsLiked((prev) => !prev);
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
  }, [isLiked]);

  // Bookmark handler
  const handleBookmark = useCallback(() => {
    setIsBookmarked((prev) => !prev);
  }, []);

  // Share handler
  const handleShare = useCallback(async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: window.location.href,
        });
      } catch {
        // User cancelled share — no action needed
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
    }
  }, [article]);

  // Comment submission with validation and error handling
  const handleAddComment = useCallback(async () => {
    const trimmed = comment.trim();
    if (!trimmed) return;
    if (trimmed.length > COMMENT_MAX_LENGTH) {
      setSubmitError(
        `Comment is too long. Please keep it under ${COMMENT_MAX_LENGTH} characters.`,
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Simulate API call (replace with real endpoint)
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          // Simulate occasional network errors for resilience testing
          if (Math.random() < 0.05) {
            reject(new Error("Network error. Please try again."));
          } else {
            resolve();
          }
        }, 500);
      });

      const newComment: CommentEntry = {
        id: `c-${Date.now()}`,
        author: "You",
        avatarGradient: "from-cyan-500 to-blue-500",
        text: trimmed,
        timestamp: "Just now",
      };

      setComments((prev) => [...prev, newComment]);
      setComment("");
      setSubmitSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [comment]);

  // Keyboard support: Ctrl+Enter to submit comment
  const handleCommentKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (!isSubmitting && comment.trim()) {
          handleAddComment();
        }
      }
    },
    [handleAddComment, isSubmitting, comment],
  );

  // Loading state
  if (isLoading) {
    return <ArticleSkeleton />;
  }

  // Error state
  if (articleError && !article) {
    return <ArticleNotFound />;
  }

  // Not found state
  if (!article || !content) {
    return <ArticleNotFound />;
  }

  const motionProps = shouldReduceMotion
    ? { initial: false, animate: { opacity: 1 } }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
      };

  return (
    <div className="xl:flex-1/2 w-full flex flex-col gap-12 items-start">
      <motion.div
        {...motionProps}
        className="bg-white rounded-md shadow-lg overflow-hidden w-full"
      >
        {/* Header */}
        <motion.div
          {...(shouldReduceMotion
            ? { initial: false, animate: { opacity: 1 } }
            : {
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                transition: { delay: 0.2 },
              })}
          className="bg-dark-btn p-8 text-white"
        >
          {/* Breadcrumb back-link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white/70 hover:text-primary-yellow text-sm mb-4 transition-colors"
          >
            <FaArrowLeft />
            Back to Blog
          </Link>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
              {article.category}
            </span>
            {article.tags.map((tag, index) => (
              <motion.span
                key={tag}
                {...(shouldReduceMotion
                  ? {}
                  : {
                      initial: { opacity: 0, scale: 0.8 },
                      animate: { opacity: 1, scale: 1 },
                      transition: { delay: 0.3 + index * 0.1 },
                    })}
                className="bg-white/15 px-2 py-1 rounded text-xs font-medium"
              >
                #{tag}
              </motion.span>
            ))}
          </div>

          <h1 className="xl:text-4xl text-2xl font-bold mb-4 leading-tight break-words">
            {article.title}
          </h1>

          <p className="xl:text-lg text-base opacity-90 mb-6 leading-relaxed">
            {article.description}
          </p>

          <div className="flex flex-wrap gap-6 text-sm opacity-90">
            <div className="flex items-center gap-2">
              <FaUser />
              <span>CYPHER Team</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCalendarAlt />
              <span>{article.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaClock />
              <span>8 min read</span>
            </div>
          </div>
        </motion.div>

        {/* Main Image */}
        <motion.div
          {...(shouldReduceMotion
            ? {}
            : {
                initial: { scale: 0.98, opacity: 0 },
                animate: { scale: 1, opacity: 1 },
                transition: { delay: 0.3, duration: 0.5 },
              })}
          className="relative"
        >
          <Img
            src={article.image}
            alt={article.title}
            className="w-full h-80 object-cover"
          />
        </motion.div>

        {/* Content */}
        <div className="p-8 max-md:p-4">
          {/* Article Body */}
          <motion.div
            {...(shouldReduceMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: 0.4 },
                })}
            className="mb-8"
          >
            {content.body.split("\n\n").map((paragraph, idx) => (
              <p
                key={idx}
                className="text-text-secondary leading-relaxed mb-6 text-base lg:text-lg"
              >
                {paragraph}
              </p>
            ))}

            {/* Feature Highlights */}
            <div className="grid md:grid-cols-2 gap-6 my-8">
              {content.features.map((box, index) => (
                <motion.div
                  key={index}
                  {...(shouldReduceMotion
                    ? {}
                    : {
                        initial: { opacity: 0, x: index % 2 === 0 ? -15 : 15 },
                        animate: { opacity: 1, x: 0 },
                        transition: { delay: 0.5 + index * 0.15 },
                      })}
                  className="bg-surface border border-border-subtle p-6 rounded-md"
                >
                  <div className="flex items-center mb-3">
                    <span className="text-primary-blue">{box.icon}</span>
                    <h3 className="text-lg font-bold text-dark-btn ml-1">
                      {box.title}
                    </h3>
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {box.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* CTA Block */}
            <div className="bg-primary-yellow/10 border border-primary-yellow/30 p-6 rounded-md my-8">
              <h3 className="text-xl font-bold mb-4 flex items-center text-dark-btn">
                <FaMobile className="mr-3 text-primary-blue" />
                Key Highlights
              </h3>
              <ul className="space-y-3">
                {content.ctaItems.map((item, idx) => (
                  <li key={idx} className="flex items-start text-text-secondary">
                    <span className="text-primary-yellow mr-3 mt-1">●</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            {...(shouldReduceMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 15 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: 0.7 },
                })}
            className="flex flex-wrap items-center justify-between border-t border-b border-border-subtle py-6 mb-8 gap-4"
          >
            <div className="flex flex-wrap gap-3">
              <motion.button
                {...(shouldReduceMotion ? {} : { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } })}
                onClick={handleLike}
                aria-label={isLiked ? "Unlike this article" : "Like this article"}
                aria-pressed={isLiked}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-200 font-medium ${
                  isLiked
                    ? "bg-primary-blue text-white shadow-md"
                    : "bg-surface text-text-secondary hover:bg-primary-blue/10 hover:text-primary-blue border border-border-subtle"
                }`}
              >
                <FaHeart className={isLiked ? "text-white" : ""} />
                <span>{likes}</span>
              </motion.button>

              <motion.button
                {...(shouldReduceMotion ? {} : { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } })}
                onClick={handleShare}
                aria-label="Share this article"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface text-text-secondary hover:bg-primary-blue/10 hover:text-primary-blue border border-border-subtle transition-all duration-200 font-medium"
              >
                <FaShare />
                <span>Share</span>
              </motion.button>

              <motion.button
                {...(shouldReduceMotion ? {} : { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } })}
                onClick={handleBookmark}
                aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this article"}
                aria-pressed={isBookmarked}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-200 font-medium ${
                  isBookmarked
                    ? "bg-primary-yellow text-dark-btn shadow-md"
                    : "bg-surface text-text-secondary hover:bg-primary-yellow/10 hover:text-primary-yellow border border-border-subtle"
                }`}
              >
                <FaBookmark className={isBookmarked ? "text-dark-btn" : ""} />
                <span>Save</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Comments Section */}
          <motion.div
            {...(shouldReduceMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: 0.8 },
                })}
          >
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-dark-btn">
              <FaComment className="text-primary-blue" />
              Reader Comments
              {comments.length > 0 && (
                <span className="text-base font-normal text-text-muted">
                  ({comments.length})
                </span>
              )}
            </h3>

            {/* Existing Comments */}
            {comments.length > 0 ? (
              <div className="space-y-4 mb-8">
                {comments.map((c, index) => (
                  <motion.div
                    key={c.id}
                    {...(shouldReduceMotion
                      ? {}
                      : {
                          initial: { opacity: 0, x: -15 },
                          animate: { opacity: 1, x: 0 },
                          transition: { delay: 0.9 + index * 0.1 },
                        })}
                    className="bg-surface border border-border-subtle p-5 rounded-md"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 bg-gradient-to-r ${c.avatarGradient} rounded-full flex items-center justify-center flex-shrink-0`}
                      >
                        <FaUser className="text-white text-sm" />
                      </div>
                      <div>
                        <p className="font-semibold text-dark-btn text-sm">
                          {c.author}
                        </p>
                        <p className="text-xs text-text-muted">{c.timestamp}</p>
                      </div>
                    </div>
                    <p className="text-text-secondary leading-relaxed text-sm break-words">
                      {c.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 mb-8 bg-surface border border-border-subtle rounded-md">
                <FaComment className="mx-auto mb-4 text-primary-blue" />
                <p className="font-medium mb-2 text-dark-btn">
                  No comments yet
                </p>
                <p className="text-sm text-text-secondary">
                  Be the first to share your thoughts on this article.
                </p>
              </div>
            )}

            {/* Add Comment Form */}
            <div className="border-2 border-border-subtle rounded-md p-6">
              <h4 className="font-bold mb-4 text-lg flex items-center gap-2 text-dark-btn">
                <FaComment className="text-primary-blue" />
                Join the Discussion
              </h4>

              <textarea
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  if (submitError) setSubmitError(null);
                  if (submitSuccess) setSubmitSuccess(false);
                }}
                onKeyDown={handleCommentKeyDown}
                placeholder={`Share your thoughts about "${article.title}"...`}
                maxLength={COMMENT_MAX_LENGTH}
                className="w-full p-4 border-2 border-border-subtle rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-200 text-text-primary text-sm"
                rows={4}
                aria-label="Write a comment"
                aria-describedby="comment-char-count"
                disabled={isSubmitting}
              />

              {/* Character count */}
              <div
                id="comment-char-count"
                className={`text-right text-xs mt-1 ${
                  comment.length > COMMENT_MAX_LENGTH * 0.9
                    ? "text-red-500 font-medium"
                    : "text-text-muted"
                }`}
              >
                {comment.length}/{COMMENT_MAX_LENGTH}
              </div>

              {/* Success message */}
              {submitSuccess && (
                <motion.div
                  {...(shouldReduceMotion
                    ? {}
                    : {
                        initial: { opacity: 0, y: -10 },
                        animate: { opacity: 1, y: 0 },
                      })}
                  className="mt-3 flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-md text-sm"
                  role="status"
                >
                  <FaCheck />
                  <span>Comment posted successfully!</span>
                </motion.div>
              )}

              {/* Error message */}
              {submitError && (
                <motion.div
                  {...(shouldReduceMotion
                    ? {}
                    : {
                        initial: { opacity: 0, y: -10 },
                        animate: { opacity: 1, y: 0 },
                      })}
                  className="mt-3 flex items-center justify-between bg-red-50 border border-red-200 p-3 rounded-md text-sm"
                  role="alert"
                >
                  <span className="text-red-700 flex items-center gap-2">
                    <FaExclamationTriangle />
                    {submitError}
                  </span>
                  <button
                    onClick={handleAddComment}
                    disabled={isSubmitting}
                    className="text-red-700 font-medium hover:text-red-900 underline disabled:opacity-50"
                  >
                    Try again
                  </button>
                </motion.div>
              )}

              {/* Submit button */}
              <div className="flex justify-between items-center mt-4">
                <motion.button
                  {...(shouldReduceMotion ? {} : { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 } })}
                  disabled={isSubmitting || !comment.trim()}
                  onClick={handleAddComment}
                  aria-busy={isSubmitting}
                  className="bg-primary-blue text-white px-6 py-2.5 rounded-full font-medium hover:bg-dark-btn transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Posting...
                    </>
                  ) : (
                    <>
                      <FaComment />
                      <span>Post Comment</span>
                    </>
                  )}
                </motion.button>
                <span className="text-xs text-text-muted max-md:hidden">
                  Press Ctrl+Enter to submit
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
