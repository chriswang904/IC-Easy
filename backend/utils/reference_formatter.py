# utils/reference_formatter.py
from typing import Optional, List
from models.schemas import LiteratureItem
from datetime import datetime
import re


class ReferenceFormatter:
    """
    Utility class for formatting literature references and in-text citations 
    in APA 7th Edition, IEEE 2025, and MLA 9th Edition styles.
    """

    # APA 7TH EDITION 
    @staticmethod
    def format_apa(literature: LiteratureItem) -> str:
        """
        APA 7th Edition Reference Format:
        Author, A. A., & Author, B. B. (Year, Month Day). Title of article. 
        Journal Title, volume(issue), pages. https://doi.org/xxxx
        """
        authors_str = ReferenceFormatter._format_authors_apa(literature)
        date_str = ReferenceFormatter._format_date_apa(literature)

        # Title in sentence case
        title = ReferenceFormatter._sentence_case_preserve_proper_nouns(literature.title)
        reference = f"{authors_str} ({date_str}). {title}."

        # Journal information
        if literature.journal:
            # Journal title in title case and italics
            reference += f" *{literature.journal}*"

        if literature.volume:
            reference += f", {literature.volume}"
            if literature.issue:
                reference += f"({literature.issue})"
            
        if literature.pages:
            reference += f", {literature.pages}"
        
        # Check endwith with period 
        if not reference.endswith('.'):
            reference += '.'

        # DOI or URL (DOI preferred)
        if literature.doi:
            reference += f" https://doi.org/{literature.doi}"
        elif literature.url:
            reference += f" {literature.url}"

        return reference.strip()

    @staticmethod
    def _format_date_apa(literature: LiteratureItem) -> str:
        """Format date for APA: (Year, Month Day) or just (Year)"""
        year = ReferenceFormatter._extract_year(literature.published_date)
        
        # If we have month information, include it
        if literature.month:
            month_str = literature.month
            # If we have a full date string, try to extract day
            if literature.published_date:
                try:
                    date_obj = datetime.fromisoformat(literature.published_date.replace('Z', '+00:00'))
                    return f"{year}, {date_obj.strftime('%B')} {date_obj.day}"
                except:
                    return f"{year}, {month_str}"
            return f"{year}, {month_str}"
        
        return year

    # IEEE 2025 
    @staticmethod
    def format_ieee(literature: LiteratureItem, index: Optional[int] = None) -> str:
        """
        IEEE 2025 Reference Format:
        [n] A. A. Author, B. B. Author, and C. C. Author, "Title of article," 
        Journal Abbrev., vol. X, no. Y, pp. Z–Z, Month Year, doi: xxxx.
        """
        authors_str = ReferenceFormatter._format_authors_ieee(literature)
        year = ReferenceFormatter._extract_year(literature.published_date)

        reference = f'{authors_str}, "{literature.title}"'

        if literature.journal:
            reference += f", *{literature.journal}*"
        
        if literature.volume:
            reference += f", vol. {literature.volume}"
        
        if literature.issue:
            reference += f", no. {literature.issue}"
        
        if literature.pages:
            # IEEE uses pp. for page ranges
            reference += f", pp. {literature.pages}"
        
        # Month and year
        if literature.month:
            reference += f", {literature.month} {year}"
        else:
            reference += f", {year}"

        # DOI or URL
        if literature.doi:
            reference += f", doi: {literature.doi}."
        elif literature.url:
            reference += f". [Online]. Available: {literature.url}"
        else:
            reference += "."

        # Add index number if provided
        if index is not None:
            reference = f"[{index}] {reference}"

        return reference.strip()

    # MLA 9TH EDITION
    @staticmethod
    def format_mla(literature: LiteratureItem) -> str:
        """
        MLA 9th Edition Reference Format:
        Author, First Last. "Title of Article." Journal Title, vol. X, no. Y, Year, pp. Z–Z. 
        DOI or URL.
        """
        authors_str = ReferenceFormatter._format_authors_mla(literature)
        year = ReferenceFormatter._extract_year(literature.published_date)

        reference = f'{authors_str}. "{literature.title}."'

        if literature.journal:
            reference += f" *{literature.journal}*"
        
        if literature.volume:
            reference += f", vol. {literature.volume}"
        
        if literature.issue:
            reference += f", no. {literature.issue}"
        
        if year and year != "n.d.":
            reference += f", {year}"
        
        # MLA 9 uses p. for single page, pp. for range
        if literature.pages:
            if '-' in literature.pages or '–' in literature.pages or 'pp' in literature.pages.lower():
                reference += f", pp. {literature.pages}"
            else:
                reference += f", p. {literature.pages}"
        
        reference += "."

        # DOI preferred over URL in MLA 9
        if literature.doi:
            reference += f" https://doi.org/{literature.doi}."
        elif literature.url:
            reference += f" {literature.url}."

        return reference.strip()

    # In-Text Citation (APA / IEEE / MLA) 
    @staticmethod
    def intext_apa(literature: LiteratureItem, page: Optional[str] = None) -> str:
        """
        APA In-text citation:
        (Smith, 2020) or (Smith & Lee, 2020, p. 15)
        """
        if not literature.authors or len(literature.authors) == 0:
            # No author - use title
            short_title = literature.title.split(':')[0][:20]
            year = ReferenceFormatter._extract_year(literature.published_date)
            citation = f'("{short_title}," {year}'
        else:
            names = [a.name.split()[-1] for a in literature.authors]
            year = ReferenceFormatter._extract_year(literature.published_date)
            
            if len(names) == 1:
                citation = f"({names[0]}, {year}"
            elif len(names) == 2:
                citation = f"({names[0]} & {names[1]}, {year}"
            else:
                citation = f"({names[0]} et al., {year}"
        
        # Add page number if provided
        if page:
            citation += f", p. {page}"
        
        return citation + ")"

    @staticmethod
    def intext_ieee(index: int) -> str:
        """
        IEEE In-text citation:
        [1]
        """
        return f"[{index}]"

    @staticmethod
    def intext_mla(literature: LiteratureItem, page: Optional[str] = None) -> str:
        """
        MLA In-text citation:
        (Smith 30) or (Smith and Lee 45)
        """
        if not literature.authors or len(literature.authors) == 0:
            # Use short title
            short_title = literature.title.split(':')[0].split()[0]
            text = f'"{short_title}"' if len(short_title) < 20 else short_title
        else:
            names = [a.name.split()[-1] for a in literature.authors]
            
            if len(names) == 1:
                text = names[0]
            elif len(names) == 2:
                text = f"{names[0]} and {names[1]}"
            else:
                text = f"{names[0]} et al."
        
        if page:
            text += f" {page}"
        
        return f"({text})"

    # Author Formatting Functions 
    @staticmethod
    def _format_authors_apa(literature: LiteratureItem) -> str:
        """
        APA: Last, F. M., & Last, F. M.
        Up to 20 authors, then use ellipsis
        """
        if not literature.authors or len(literature.authors) == 0:
            return "Unknown Author"
        
        if len(literature.authors) == 1:
            return ReferenceFormatter._format_author_apa(literature.authors[0].name)
        elif len(literature.authors) <= 20:
            authors = [ReferenceFormatter._format_author_apa(a.name) for a in literature.authors]
            return ", ".join(authors[:-1]) + f", & {authors[-1]}"
        else:
            # More than 20 authors: list first 19, then ellipsis, then last
            authors = [ReferenceFormatter._format_author_apa(a.name) for a in literature.authors[:19]]
            last_author = ReferenceFormatter._format_author_apa(literature.authors[-1].name)
            return ", ".join(authors) + f", ... {last_author}"

    @staticmethod
    def _format_authors_ieee(literature: LiteratureItem) -> str:
        """
        IEEE: F. M. Last, F. M. Last, and F. M. Last
        Up to 3 authors, then use "et al."
        """
        if not literature.authors or len(literature.authors) == 0:
            return "Unknown"
        
        if len(literature.authors) == 1:
            return ReferenceFormatter._format_author_ieee(literature.authors[0].name)
        elif len(literature.authors) == 2:
            return f"{ReferenceFormatter._format_author_ieee(literature.authors[0].name)} and {ReferenceFormatter._format_author_ieee(literature.authors[1].name)}"
        elif len(literature.authors) == 3:
            return f"{ReferenceFormatter._format_author_ieee(literature.authors[0].name)}, {ReferenceFormatter._format_author_ieee(literature.authors[1].name)}, and {ReferenceFormatter._format_author_ieee(literature.authors[2].name)}"
        else:
            return f"{ReferenceFormatter._format_author_ieee(literature.authors[0].name)} et al."

    @staticmethod
    def _format_authors_mla(literature: LiteratureItem) -> str:
        """
        MLA: Last, First Middle. or Last, First, et al.
        """
        if not literature.authors or len(literature.authors) == 0:
            return "Unknown Author"
        
        first_author = ReferenceFormatter._format_author_mla(literature.authors[0].name)
        
        if len(literature.authors) == 1:
            return first_author
        elif len(literature.authors) == 2:
            second = literature.authors[1].name
            return f"{first_author}, and {second}"
        else:
            return f"{first_author}, et al."

    @staticmethod
    def _format_author_apa(full_name: str) -> str:
        """Format: Last, F. M."""
        parts = full_name.strip().split()
        if len(parts) >= 2:
            last = parts[-1]
            initials = ". ".join(p[0].upper() for p in parts[:-1]) + "."
            return f"{last}, {initials}"
        return full_name

    @staticmethod
    def _format_author_ieee(full_name: str) -> str:
        """Format: F. M. Last"""
        parts = full_name.strip().split()
        if len(parts) >= 2:
            last = parts[-1]
            initials = ". ".join(p[0].upper() for p in parts[:-1]) + "."
            return f"{initials} {last}"
        return full_name

    @staticmethod
    def _format_author_mla(full_name: str) -> str:
        """Format: Last, First Middle"""
        parts = full_name.strip().split()
        if len(parts) >= 2:
            last = parts[-1]
            first = " ".join(parts[:-1])
            return f"{last}, {first}"
        return full_name

    # Helper Functions
    @staticmethod
    def _sentence_case_preserve_proper_nouns(text: str) -> str:
        """
        Convert to sentence case but preserve words that start with capital
        (likely proper nouns)
        """
        if not text:
            return ""
        
        text = text.strip()
        
        # Split into words
        words = text.split()
        if not words:
            return ""
        
        result = []
        for i, word in enumerate(words):
            if i == 0:
                # First word: capitalize first letter
                result.append(word[0].upper() + word[1:].lower() if len(word) > 1 else word.upper())
            elif word[0].isupper() and len(word) > 1:
                # Preserve capitalized words (likely proper nouns)
                result.append(word)
            else:
                # Lowercase other words
                result.append(word.lower())
        
        return " ".join(result)

    @staticmethod
    def _extract_year(date_str: Optional[str]) -> str:
        """
        Extract year from date string.
        Supports ISO format (YYYY-MM-DD) and other common formats.
        """
        if not date_str:
            return "n.d."
        
        try:
            # Try parsing as ISO format
            date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            return str(date_obj.year)
        except (ValueError, AttributeError):
            # Try to extract 4-digit year using regex
            match = re.search(r'\b(19|20)\d{2}\b', date_str)
            if match:
                return match.group(0)
            
            # Fallback: try to split by common separators
            for sep in ['-', '/', '.']:
                if sep in date_str:
                    parts = date_str.split(sep)
                    for part in parts:
                        if len(part) == 4 and part.isdigit():
                            return part
            
            return "n.d."

    @staticmethod
    def _extract_month(date_str: Optional[str]) -> Optional[str]:
        """Extract month name from date string"""
        if not date_str:
            return None
        
        try:
            date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            return date_obj.strftime('%B')  # Full month name
        except:
            return None


# Batch Formatting Functions 
def format_references_batch(
    literature_list: List[LiteratureItem],
    style: str = "apa"
) -> List[str]:
    """
    Format a list of literature items in the specified style.
    
    Args:
        literature_list: List of LiteratureItem objects
        style: Citation style - "apa", "ieee", or "mla"
    
    Returns:
        List of formatted reference strings
    """
    formatted_refs = []
    
    for i, lit in enumerate(literature_list, start=1):
        if style.lower() == "apa":
            formatted_refs.append(ReferenceFormatter.format_apa(lit))
        elif style.lower() == "ieee":
            formatted_refs.append(ReferenceFormatter.format_ieee(lit, index=i))
        elif style.lower() == "mla":
            formatted_refs.append(ReferenceFormatter.format_mla(lit))
        else:
            raise ValueError(f"Unsupported citation style: {style}")
    
    return formatted_refs


def create_bibliography(
    literature_list: List[LiteratureItem],
    style: str = "apa",
    sort: bool = True
) -> str:
    """
    Create a complete bibliography/reference list.
    
    Args:
        literature_list: List of LiteratureItem objects
        style: Citation style - "apa", "ieee", or "mla"
        sort: Whether to sort alphabetically (for APA/MLA)
    
    Returns:
        Formatted bibliography as a string
    """
    # Sort by first author's last name for APA/MLA
    if sort and style.lower() in ["apa", "mla"]:
        literature_list = sorted(
            literature_list,
            key=lambda x: x.authors[0].name.split()[-1] if x.authors else x.title
        )
    
    # Format all references
    refs = format_references_batch(literature_list, style)
    
    # Add appropriate header
    if style.lower() == "apa":
        header = "References\n\n"
    elif style.lower() == "ieee":
        header = "References\n\n"
    else:  # MLA
        header = "Works Cited\n\n"
    
    return header + "\n\n".join(refs)