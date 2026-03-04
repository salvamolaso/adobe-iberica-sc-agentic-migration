/* eslint-disable */
/* global WebImporter */

/**
 * Parser for embed block (video)
 *
 * Source: https://sede.madrid.es/portal/site/tramites/...
 * Base Block: embed
 *
 * Block Structure (from markdown example):
 * - Row 1: Block name header ("Embed")
 * - Row 2: Video URL (single cell with link)
 *
 * Source HTML Pattern (from captured DOM):
 * <div class="contenedor-responsivo">
 *   <iframe title="YouTube video player" src="https://www.youtube.com/embed/3x5jAfufK50"></iframe>
 * </div>
 *
 * Generated: 2026-03-04
 */
export default function parse(element, { document }) {
  // Extract video URL from iframe src
  // VALIDATED: Source HTML has <iframe> inside .contenedor-responsivo
  const iframe = element.querySelector('iframe');

  if (!iframe) return;

  let videoUrl = iframe.getAttribute('src') || '';

  // Convert YouTube embed URL to standard watch URL
  // e.g., https://www.youtube.com/embed/3x5jAfufK50 -> https://www.youtube.com/watch?v=3x5jAfufK50
  const youtubeEmbedMatch = videoUrl.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  if (youtubeEmbedMatch) {
    videoUrl = `https://www.youtube.com/watch?v=${youtubeEmbedMatch[1]}`;
  }

  // Convert Vimeo embed URL if needed
  const vimeoEmbedMatch = videoUrl.match(/player\.vimeo\.com\/video\/(\d+)/);
  if (vimeoEmbedMatch) {
    videoUrl = `https://vimeo.com/${vimeoEmbedMatch[1]}`;
  }

  // Create link element for the video URL
  const link = document.createElement('a');
  link.href = videoUrl;
  link.textContent = videoUrl;

  // Build cells array matching embed block markdown example structure
  // Row 1: Single cell with video URL link
  const cells = [
    [link],
  ];

  // Create block using WebImporter utility
  const block = WebImporter.Blocks.createBlock(document, { name: 'Embed', cells });

  // Replace original element with structured block table
  element.replaceWith(block);
}
