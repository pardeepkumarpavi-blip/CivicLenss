import os
import sys
from PIL import Image
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# ---------------------------------------------------------------------------
# COLOR PALETTE DEFINITION
# ---------------------------------------------------------------------------
# Dark theme colors (Slides 1 & 6)
NAVY_BG = RGBColor(11, 25, 44)        # #0B192C Dark Obsidian
NAVY_CARD = RGBColor(19, 39, 67)      # #132743 Dark Surface Card
NAVY_CARD_DEEP = RGBColor(10, 20, 34) # #0A1422 Deep container
NAVY_BORDER = RGBColor(30, 58, 95)    # #1E3A5F Border
NAVY_BORDER_ACC = RGBColor(2, 132, 199) # #0284C7 Accent border

# Light theme colors (Slides 2, 3, 4, 5)
LIGHT_BG = RGBColor(248, 250, 252)    # #F8FAFC Crisp Light Slate
CARD_BG = RGBColor(255, 255, 255)     # #FFFFFF Pure White
CARD_BORDER = RGBColor(226, 232, 240) # #E2E8F0 Subtle Border
CARD_BORDER_STRONG = RGBColor(203, 213, 225) # #CBD5E1

# Brand Accents
ACCENT_BLUE = RGBColor(2, 132, 199)    # #0284C7 Civic Blue
ACCENT_CYAN = RGBColor(6, 182, 212)    # #06B6D4 Teal / Cyan
ACCENT_EMERALD = RGBColor(16, 185, 129)# #10B981 Emerald Green
ACCENT_AMBER = RGBColor(245, 158, 11)  # #F59E0B Warning Amber
ACCENT_ROSE = RGBColor(239, 68, 68)    # #EF4444 Danger Rose
ACCENT_PURPLE = RGBColor(139, 92, 246) # #8B5CF6 Indigo / Purple
ACCENT_GOLD = RGBColor(251, 191, 36)   # #FBBF24 Warm Gold

# Badge Backgrounds (Light)
BADGE_BLUE_BG = RGBColor(224, 242, 254)   # #E0F2FE
BADGE_EMERALD_BG = RGBColor(220, 252, 231)# #DCFCE7
BADGE_AMBER_BG = RGBColor(254, 243, 199)  # #FEF3C7
BADGE_ROSE_BG = RGBColor(254, 226, 226)   # #FEE2E2
BADGE_PURPLE_BG = RGBColor(243, 232, 255) # #F3E8FF

# Badge Backgrounds (Dark)
BADGE_DARK_BLUE = RGBColor(14, 45, 78)
BADGE_DARK_EMERALD = RGBColor(10, 50, 40)

# Typography Colors
TEXT_DARK = RGBColor(15, 23, 42)          # #0F172A Dark Slate
TEXT_MUTED = RGBColor(100, 116, 139)      # #64748B Muted Slate
TEXT_MUTED_DARK = RGBColor(71, 85, 105)   # #475569 Slate 600
TEXT_WHITE = RGBColor(255, 255, 255)
TEXT_LIGHT_MUTED = RGBColor(148, 163, 184)# #94A3B8
TEXT_LIGHT_CYAN = RGBColor(56, 189, 248)  # #38BDF8
TEXT_LIGHT_EMERALD = RGBColor(52, 211, 153)# #34D399

FONT_FAMILY = "Segoe UI"
ASSETS_DIR = r"C:\Users\DELL\Desktop\CivicLens\presentation-assets"
OUTPUT_PPTX = r"C:\Users\DELL\Desktop\CivicLens\CivicLens_AI_Municipal_Presentation.pptx"

# ---------------------------------------------------------------------------
# CORE HELPER FUNCTIONS
# ---------------------------------------------------------------------------
def set_slide_background(slide, color):
    """Fills the slide background with a solid color."""
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = color

def add_rect(slide, left, top, width, height, fill_color, border_color=None, border_width=1, rounded=True):
    """Draws a styled rectangle or rounded rectangle."""
    shape_type = MSO_SHAPE.ROUNDED_RECTANGLE if rounded else MSO_SHAPE.RECTANGLE
    shape = slide.shapes.add_shape(shape_type, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color
    if border_color:
        shape.line.color.rgb = border_color
        shape.line.width = Pt(border_width)
    else:
        shape.line.fill.background()
    return shape

def add_pill(slide, left, top, width, height, text, bg_color, text_color, font_size=9, bold=True):
    """Draws a compact badge/pill label."""
    pill = add_rect(slide, left, top, width, height, bg_color, border_color=None, rounded=True)
    tf = pill.text_frame
    tf.word_wrap = False
    tf.margin_left = Inches(0.08)
    tf.margin_right = Inches(0.08)
    tf.margin_top = Inches(0.02)
    tf.margin_bottom = Inches(0.02)
    p = tf.paragraphs[0]
    p.text = text
    p.font.name = FONT_FAMILY
    p.font.size = Pt(font_size)
    p.font.bold = bold
    p.font.color.rgb = text_color
    p.alignment = PP_ALIGN.CENTER
    return pill

def add_header(slide, pill_text, title_text, subtitle_text, is_dark=False):
    """Creates a unified header banner at the top of a slide."""
    pill_bg = BADGE_DARK_BLUE if is_dark else BADGE_BLUE_BG
    pill_text_color = TEXT_LIGHT_CYAN if is_dark else ACCENT_BLUE
    
    # Pill
    add_pill(slide, Inches(0.8), Inches(0.4), Inches(2.8), Inches(0.28), pill_text.upper(), pill_bg, pill_text_color, font_size=8.5, bold=True)
    
    # Title & Subtitle Box
    tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.72), Inches(11.73), Inches(0.7))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0)
    tf.margin_top = Inches(0)
    tf.margin_right = Inches(0)
    tf.margin_bottom = Inches(0)
    
    p = tf.paragraphs[0]
    p.text = title_text
    p.font.name = FONT_FAMILY
    p.font.size = Pt(22)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE if is_dark else TEXT_DARK
    
    p2 = tf.add_paragraph()
    p2.text = subtitle_text
    p2.font.name = FONT_FAMILY
    p2.font.size = Pt(11)
    p2.font.bold = False
    p2.font.color.rgb = TEXT_LIGHT_MUTED if is_dark else TEXT_MUTED
    p2.space_before = Pt(3)

def add_screenshot_frame(slide, left, top, width, height, img_filename, card_title, caption_text):
    """Creates an executive browser-style container for a genuine screenshot with title and caption."""
    # Outer Card
    outer_card = add_rect(slide, left, top, width, height, CARD_BG, CARD_BORDER, border_width=1, rounded=True)
    
    # Card Header Bar
    header_h = Inches(0.35)
    header_bar = add_rect(slide, left, top, width, header_h, RGBColor(241, 245, 249), CARD_BORDER, border_width=1, rounded=False)
    
    # Window Dots (Mac style visual cues)
    dot_colors = [RGBColor(239, 68, 68), RGBColor(245, 158, 11), RGBColor(16, 185, 129)]
    for i, dc in enumerate(dot_colors):
        dot = slide.shapes.add_shape(MSO_SHAPE.OVAL, left + Inches(0.12 + i * 0.14), top + Inches(0.12), Inches(0.09), Inches(0.09))
        dot.fill.solid()
        dot.fill.fore_color.rgb = dc
        dot.line.fill.background()
        
    # Card Title in Header
    tb_title = slide.shapes.add_textbox(left + Inches(0.65), top + Inches(0.06), width - Inches(0.75), Inches(0.24))
    tf_t = tb_title.text_frame
    tf_t.word_wrap = False
    tf_t.margin_left = Inches(0)
    tf_t.margin_top = Inches(0)
    p_t = tf_t.paragraphs[0]
    p_t.text = card_title
    p_t.font.name = FONT_FAMILY
    p_t.font.size = Pt(9.5)
    p_t.font.bold = True
    p_t.font.color.rgb = TEXT_DARK
    
    # Image Area Calculation (Maintain strict aspect ratio)
    img_path = os.path.join(ASSETS_DIR, img_filename)
    caption_h = Inches(0.55)
    available_w = width - Inches(0.16)
    available_h = height - header_h - caption_h - Inches(0.1)
    
    if os.path.exists(img_path):
        with Image.open(img_path) as im:
            orig_w, orig_h = im.size
        img_aspect = orig_w / orig_h
        box_aspect = (available_w / available_h)
        
        if img_aspect > box_aspect:
            fit_w = available_w
            fit_h = available_w / img_aspect
        else:
            fit_h = available_h
            fit_w = available_h * img_aspect
            
        fit_left = left + Inches(0.08) + (available_w - fit_w) / 2
        fit_top = top + header_h + Inches(0.05) + (available_h - fit_h) / 2
        
        # Border box around screenshot
        frame_box = add_rect(slide, fit_left - Inches(0.01), fit_top - Inches(0.01), fit_w + Inches(0.02), fit_h + Inches(0.02), RGBColor(226, 232, 240), RGBColor(203, 213, 225), border_width=1, rounded=False)
        slide.shapes.add_picture(img_path, fit_left, fit_top, fit_w, fit_h)
        
    # Caption Box at bottom
    tb_cap = slide.shapes.add_textbox(left + Inches(0.12), top + height - caption_h + Inches(0.04), width - Inches(0.24), caption_h - Inches(0.06))
    tf_c = tb_cap.text_frame
    tf_c.word_wrap = True
    tf_c.margin_left = Inches(0)
    tf_c.margin_top = Inches(0)
    tf_c.margin_right = Inches(0)
    tf_c.margin_bottom = Inches(0)
    p_c = tf_c.paragraphs[0]
    p_c.text = caption_text
    p_c.font.name = FONT_FAMILY
    p_c.font.size = Pt(8.5)
    p_c.font.color.rgb = TEXT_MUTED_DARK

# ---------------------------------------------------------------------------
# SLIDE 1 BUILDER — INTRODUCTION
# ---------------------------------------------------------------------------
def build_slide_1(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide, NAVY_BG)
    
    # Decorative subtle glow accents (dark cards in background)
    glow1 = add_rect(slide, Inches(9.5), Inches(0.5), Inches(3.2), Inches(3.2), RGBColor(14, 30, 52), border_color=None, rounded=True)
    
    # 1. Top Category Pill
    add_pill(slide, Inches(1.0), Inches(0.65), Inches(4.3), Inches(0.32), "MUNICIPAL COMMITTEE PRESENTATION  •  PILOT PROPOSAL", BADGE_DARK_BLUE, TEXT_LIGHT_CYAN, font_size=9, bold=True)
    
    # 2. Main Title: CIVICLENS AI
    tb_title = slide.shapes.add_textbox(Inches(1.0), Inches(1.15), Inches(11.3), Inches(0.9))
    tf_title = tb_title.text_frame
    tf_title.word_wrap = True
    tf_title.margin_left = Inches(0)
    tf_title.margin_top = Inches(0)
    p_title = tf_title.paragraphs[0]
    p_title.text = "CIVICLENS AI"
    p_title.font.name = FONT_FAMILY
    p_title.font.size = Pt(46)
    p_title.font.bold = True
    p_title.font.color.rgb = TEXT_WHITE
    
    # 3. Tagline: Report. Route. Resolve.
    tb_tag = slide.shapes.add_textbox(Inches(1.0), Inches(2.10), Inches(11.3), Inches(0.45))
    tf_tag = tb_tag.text_frame
    tf_tag.word_wrap = True
    tf_tag.margin_left = Inches(0)
    tf_tag.margin_top = Inches(0)
    p_tag = tf_tag.paragraphs[0]
    p_tag.text = "Report.  Route.  Resolve."
    p_tag.font.name = FONT_FAMILY
    p_tag.font.size = Pt(22)
    p_tag.font.bold = True
    p_tag.font.color.rgb = TEXT_LIGHT_CYAN
    
    # 4. Product Definition Label
    tb_def_label = slide.shapes.add_textbox(Inches(1.0), Inches(2.62), Inches(11.3), Inches(0.35))
    tf_dl = tb_def_label.text_frame
    tf_dl.word_wrap = True
    tf_dl.margin_left = Inches(0)
    tf_dl.margin_top = Inches(0)
    p_dl = tf_dl.paragraphs[0]
    p_dl.text = "AN AI-POWERED CIVIC COMPLAINT MANAGEMENT & ENVIRONMENTAL MONITORING PLATFORM"
    p_dl.font.name = FONT_FAMILY
    p_dl.font.size = Pt(11)
    p_dl.font.bold = True
    p_dl.font.color.rgb = TEXT_LIGHT_EMERALD
    
    # 5. Formal Subtitle
    tb_sub = slide.shapes.add_textbox(Inches(1.0), Inches(3.02), Inches(11.3), Inches(0.4))
    tf_sub = tb_sub.text_frame
    tf_sub.word_wrap = True
    tf_sub.margin_left = Inches(0)
    tf_sub.margin_top = Inches(0)
    p_sub = tf_sub.paragraphs[0]
    p_sub.text = '"Transforming Civic Complaints into Accountable Community Action"'
    p_sub.font.name = FONT_FAMILY
    p_sub.font.size = Pt(15)
    p_sub.font.italic = True
    p_sub.font.color.rgb = RGBColor(226, 232, 240)
    
    # 6. Concise Platform Description Card
    desc_card = add_rect(slide, Inches(1.0), Inches(3.60), Inches(11.33), Inches(1.50), NAVY_CARD, NAVY_BORDER, border_width=1, rounded=True)
    tb_desc = slide.shapes.add_textbox(Inches(1.25), Inches(3.75), Inches(10.8), Inches(1.2))
    tf_desc = tb_desc.text_frame
    tf_desc.word_wrap = True
    tf_desc.margin_left = Inches(0)
    tf_desc.margin_top = Inches(0)
    
    p_d1 = tf_desc.paragraphs[0]
    p_d1.text = "A centralized digital platform that connects citizens with municipal authorities to report, track, and resolve civic and environmental issues using AI and location intelligence."
    p_d1.font.name = FONT_FAMILY
    p_d1.font.size = Pt(13)
    p_d1.font.color.rgb = RGBColor(241, 245, 249)
    
    p_d2 = tf_desc.add_paragraph()
    p_d2.text = "Engineered as an independent municipal technology ecosystem ready for committee evaluation, administrative pilot deployment, and cross-departmental integration across Karachi and urban Sindh."
    p_d2.font.name = FONT_FAMILY
    p_d2.font.size = Pt(10.5)
    p_d2.font.color.rgb = TEXT_LIGHT_MUTED
    p_d2.space_before = Pt(8)
    
    # 7. Presenters & Institutional Card at Bottom
    footer_card = add_rect(slide, Inches(1.0), Inches(5.35), Inches(11.33), Inches(1.60), NAVY_CARD_DEEP, NAVY_BORDER, border_width=1, rounded=True)
    
    tb_pres_label = slide.shapes.add_textbox(Inches(1.25), Inches(5.48), Inches(4.0), Inches(0.25))
    tf_pl = tb_pres_label.text_frame
    tf_pl.word_wrap = False
    tf_pl.margin_left = Inches(0)
    tf_pl.margin_top = Inches(0)
    p_pl = tf_pl.paragraphs[0]
    p_pl.text = "PRESENTED BY:"
    p_pl.font.name = FONT_FAMILY
    p_pl.font.size = Pt(10)
    p_pl.font.bold = True
    p_pl.font.color.rgb = TEXT_LIGHT_CYAN
    
    # 3 Presenter Cards
    presenters = [
        ("Pardeep Kumar", "Project Architect & AI Lead"),
        ("Vishal Kumar", "Full-Stack & Municipal Operations"),
        ("Parkash", "Geospatial Systems & Data Security")
    ]
    
    card_w = Inches(3.45)
    card_gap = Inches(0.20)
    for idx, (name, role) in enumerate(presenters):
        c_left = Inches(1.25) + idx * (card_w + card_gap)
        p_box = add_rect(slide, c_left, Inches(5.80), card_w, Inches(0.95), NAVY_CARD, NAVY_BORDER, border_width=1, rounded=True)
        tb_p = slide.shapes.add_textbox(c_left + Inches(0.15), Inches(5.90), card_w - Inches(0.3), Inches(0.75))
        tf_p = tb_p.text_frame
        tf_p.word_wrap = True
        tf_p.margin_left = Inches(0)
        tf_p.margin_top = Inches(0)
        
        p_name = tf_p.paragraphs[0]
        p_name.text = name
        p_name.font.name = FONT_FAMILY
        p_name.font.size = Pt(13)
        p_name.font.bold = True
        p_name.font.color.rgb = TEXT_WHITE
        
        p_role = tf_p.add_paragraph()
        p_role.text = role
        p_role.font.name = FONT_FAMILY
        p_role.font.size = Pt(9.5)
        p_role.font.color.rgb = TEXT_LIGHT_MUTED
        p_role.space_before = Pt(3)

# ---------------------------------------------------------------------------
# SLIDE 2 BUILDER — THE PROBLEM WE SOLVE
# ---------------------------------------------------------------------------
def build_slide_2(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide, LIGHT_BG)
    
    # Header
    add_header(slide, "CIVIC CHALLENGES & MUNICIPAL REALITY", "The Problem We Solve", "Severe civic hazards, jurisdictional ambiguity, and zero complaint accountability across urban centers.")
    
    # Context Quote Banner
    banner = add_rect(slide, Inches(0.8), Inches(1.50), Inches(11.73), Inches(0.60), CARD_BG, CARD_BORDER, border_width=1, rounded=True)
    tb_banner = slide.shapes.add_textbox(Inches(1.0), Inches(1.58), Inches(11.33), Inches(0.45))
    tf_b = tb_banner.text_frame
    tf_b.word_wrap = True
    tf_b.margin_left = Inches(0)
    tf_b.margin_top = Inches(0)
    p_b = tf_b.paragraphs[0]
    p_b.text = "In Karachi and growing metropolitan areas, citizens face acute urban problems but struggle to identify the responsible municipal agency. Traditional reporting channels lack tracking, leaving critical hazards unresolved."
    p_b.font.name = FONT_FAMILY
    p_b.font.size = Pt(10)
    p_b.font.color.rgb = TEXT_DARK
    
    # 6 Problem Cards in 3x2 Grid
    problems = [
        {
            "tag": "SOLID WASTE HAZARD",
            "tag_bg": BADGE_AMBER_BG,
            "tag_color": RGBColor(180, 83, 9),
            "title": "Garbage Accumulation & Dumping",
            "desc": "Uncollected domestic and commercial waste clogs thoroughfares, generates toxic leachate, and creates immediate public health hazards in dense residential corridors.",
            "impact": "Agency Impact: Solid Waste Management (SSWMB)"
        },
        {
            "tag": "STORMWATER CONGESTION",
            "tag_bg": BADGE_BLUE_BG,
            "tag_color": ACCENT_BLUE,
            "title": "Blocked Drainage & Urban Flooding",
            "desc": "Choked nullahs, silted storm drains, and overflowing sewage inundate major arterial roads during rainfall, damaging infrastructure and paralyzing city transit.",
            "impact": "Agency Impact: Water & Sewerage Board (KW&SC)"
        },
        {
            "tag": "WATER INFRASTRUCTURE",
            "tag_bg": BADGE_EMERALD_BG,
            "tag_color": RGBColor(5, 150, 105),
            "title": "Potable Water Pipeline Leakages",
            "desc": "High-pressure conduit ruptures waste millions of gallons of treated water daily, exacerbating severe water scarcity while undermining road foundations.",
            "impact": "Agency Impact: Water Distribution Authorities"
        },
        {
            "tag": "TRANSPORTATION SAFETY",
            "tag_bg": BADGE_ROSE_BG,
            "tag_color": ACCENT_ROSE,
            "title": "Damaged Roads & Severe Potholes",
            "desc": "Unrepaired asphalt collapse, open utility trenches, and craters cause vehicle damage, severe traffic congestion, and fatal two-wheeler accidents.",
            "impact": "Agency Impact: Metropolitan Corporation (KMC / DMCs)"
        },
        {
            "tag": "PUBLIC SAFETY RISK",
            "tag_bg": BADGE_AMBER_BG,
            "tag_color": RGBColor(217, 119, 6),
            "title": "Broken Streetlights & Dark Spots",
            "desc": "Extensive blackout zones along primary and neighborhood corridors severely compromise nocturnal security, elevate crime rates, and increase collisions.",
            "impact": "Agency Impact: Municipal Engineering & Lighting"
        },
        {
            "tag": "SYSTEMIC OPACITY",
            "tag_bg": BADGE_PURPLE_BG,
            "tag_color": ACCENT_PURPLE,
            "title": "Jurisdictional Confusion & Zero Tracking",
            "desc": "Citizens cannot navigate overlapping boundaries (KMC, SSWMB, KW&SC, Cantonments). Complaints vanish into paper files with no feedback or closure proof.",
            "impact": "Core Bottleneck: Lack of Centralized Platform"
        }
    ]
    
    col_w = Inches(3.75)
    row_h = Inches(2.35)
    xs = [Inches(0.8), Inches(4.79), Inches(8.78)]
    ys = [Inches(2.25), Inches(4.80)]
    
    for i, p_info in enumerate(problems):
        col = i % 3
        row = i // 3
        cx = xs[col]
        cy = ys[row]
        
        # Card container
        card = add_rect(slide, cx, cy, col_w, row_h, CARD_BG, CARD_BORDER, border_width=1, rounded=True)
        
        # Tag pill
        add_pill(slide, cx + Inches(0.18), cy + Inches(0.18), Inches(2.2), Inches(0.24), p_info["tag"], p_info["tag_bg"], p_info["tag_color"], font_size=8, bold=True)
        
        # Content Box
        tb = slide.shapes.add_textbox(cx + Inches(0.18), cy + Inches(0.48), col_w - Inches(0.36), row_h - Inches(0.55))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0)
        tf.margin_top = Inches(0)
        
        # Title
        p_t = tf.paragraphs[0]
        p_t.text = p_info["title"]
        p_t.font.name = FONT_FAMILY
        p_t.font.size = Pt(12)
        p_t.font.bold = True
        p_t.font.color.rgb = TEXT_DARK
        
        # Body
        p_d = tf.add_paragraph()
        p_d.text = p_info["desc"]
        p_d.font.name = FONT_FAMILY
        p_d.font.size = Pt(9.2)
        p_d.font.color.rgb = TEXT_MUTED_DARK
        p_d.space_before = Pt(4)
        
        # Impact Note
        p_imp = tf.add_paragraph()
        p_imp.text = "• " + p_info["impact"]
        p_imp.font.name = FONT_FAMILY
        p_imp.font.size = Pt(8.5)
        p_imp.font.bold = True
        p_imp.font.color.rgb = p_info["tag_color"]
        p_imp.space_before = Pt(6)

# ---------------------------------------------------------------------------
# SLIDE 3 BUILDER — OUR SOLUTION: CIVICLENS AI
# ---------------------------------------------------------------------------
def build_slide_3(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide, LIGHT_BG)
    
    # Header
    add_header(slide, "SYSTEM ARCHITECTURE & CORE WORKFLOW", "Our Solution: CivicLens AI", "An intelligent civic complaint pipeline: REPORT → AI ANALYSIS → ROUTING → TRACKING → RESOLUTION")
    
    # 5-Step Horizontal Workflow Pipeline
    steps = [
        ("01", "CITIZEN REPORT", "Photo & GPS Lodgment", "Citizen uploads on-site evidence with precise OpenStreetMap coordinates.", BADGE_BLUE_BG, ACCENT_BLUE),
        ("02", "AI ANALYSIS", "Gemini Multimodal Triage", "AI classifies visual evidence, detects severity, and validates genuine civic issues.", BADGE_PURPLE_BG, ACCENT_PURPLE),
        ("03", "DEPT ROUTING", "Jurisdictional Match", "System auto-maps location to SSWMB, KW&SC, KMC, or SEPA without delay.", BADGE_AMBER_BG, RGBColor(180, 83, 9)),
        ("04", "TRACKING", "Engineering Dispatch", "Municipal officers inspect queue, assign field teams, and track operational SLAs.", BADGE_BLUE_BG, ACCENT_BLUE),
        ("05", "RESOLUTION", "Two-Key Closure Proof", "Officer submits photo proof; citizen verifies completed work for final closure.", BADGE_EMERALD_BG, RGBColor(5, 150, 105))
    ]
    
    step_w = Inches(2.18)
    step_gap = Inches(0.20)
    step_y = Inches(1.45)
    step_h = Inches(1.85)
    
    for i, (num, label, sub_lbl, desc, bg_badge, c_acc) in enumerate(steps):
        sx = Inches(0.8) + i * (step_w + step_gap)
        
        # Step Container Card
        card = add_rect(slide, sx, step_y, step_w, step_h, CARD_BG, CARD_BORDER, border_width=1, rounded=True)
        
        # Step number badge
        add_pill(slide, sx + Inches(0.12), step_y + Inches(0.12), Inches(0.7), Inches(0.24), num, bg_badge, c_acc, font_size=8.5, bold=True)
        
        # Arrow indicator between steps
        if i < 4:
            arrow_tb = slide.shapes.add_textbox(sx + step_w - Inches(0.05), step_y + Inches(0.7), step_gap + Inches(0.1), Inches(0.4))
            tf_a = arrow_tb.text_frame
            tf_a.word_wrap = False
            tf_a.margin_left = Inches(0)
            tf_a.margin_top = Inches(0)
            p_a = tf_a.paragraphs[0]
            p_a.text = "→"
            p_a.font.name = FONT_FAMILY
            p_a.font.size = Pt(16)
            p_a.font.bold = True
            p_a.font.color.rgb = ACCENT_BLUE
            p_a.alignment = PP_ALIGN.CENTER
            
        # Step text
        tb = slide.shapes.add_textbox(sx + Inches(0.12), step_y + Inches(0.42), step_w - Inches(0.24), step_h - Inches(0.48))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0)
        tf.margin_top = Inches(0)
        
        p1 = tf.paragraphs[0]
        p1.text = label
        p1.font.name = FONT_FAMILY
        p1.font.size = Pt(10.5)
        p1.font.bold = True
        p1.font.color.rgb = TEXT_DARK
        
        p2 = tf.add_paragraph()
        p2.text = sub_lbl
        p2.font.name = FONT_FAMILY
        p2.font.size = Pt(8.5)
        p2.font.bold = True
        p2.font.color.rgb = c_acc
        p2.space_before = Pt(2)
        
        p3 = tf.add_paragraph()
        p3.text = desc
        p3.font.name = FONT_FAMILY
        p3.font.size = Pt(8.2)
        p3.font.color.rgb = TEXT_MUTED_DARK
        p3.space_before = Pt(4)
        
    # 3 Deep Capability Feature Cards at Bottom
    feat_y = Inches(3.50)
    feat_h = Inches(3.55)
    feat_w = Inches(3.75)
    xs = [Inches(0.8), Inches(4.79), Inches(8.78)]
    
    features = [
        {
            "tag": "MULTIMODAL GEMINI AI",
            "tag_bg": BADGE_PURPLE_BG,
            "tag_color": ACCENT_PURPLE,
            "title": "Intelligent Visual Triage",
            "bullets": [
                ("Visual Verification", "Validates photographic evidence of legitimate municipal defects and automatically filters out non-civic imagery."),
                ("Automated Categorization", "Accurately maps reports to Waste, Drainage, Roads, Water, or Electrical infrastructure."),
                ("Severity & Hazard Scoring", "Detects emergency risks (e.g., exposed live electrical cables or major road collapses) for urgent escalation."),
                ("Proximity Duplicate Prevention", "Identifies existing complaints within close physical proximity to prevent redundant municipal dispatches.")
            ]
        },
        {
            "tag": "GEOSPATIAL INTELLIGENCE",
            "tag_bg": BADGE_BLUE_BG,
            "tag_color": ACCENT_BLUE,
            "title": "Precision Location Engine",
            "bullets": [
                ("OpenStreetMap Grounding", "Enables exact GPS coordinates via drag-and-drop pin, eliminating vague verbal location descriptions."),
                ("Administrative Boundary Mapping", "Maps coordinates to specific Union Councils, Wards, and Karachi Municipal Corporation districts."),
                ("Spatial Incident Clustering", "Visualizes real-time complaint distribution and hotspots across Karachi on an interactive map."),
                ("Public Transparency Map", "Allows citizens to view community incidents in their vicinity and monitor progress collectively.")
            ]
        },
        {
            "tag": "OPERATIONAL GOVERNANCE",
            "tag_bg": BADGE_EMERALD_BG,
            "tag_color": RGBColor(5, 150, 105),
            "title": "Two-Key Accountability Protocol",
            "bullets": [
                ("Persistent Tracking ID", "Generates immutable reference codes (e.g. CL-2026-00003) for complete end-to-end auditability."),
                ("Role-Based Authority Console", "Restricted engineering workspace where municipal officers review, assign, and update caseloads."),
                ("Mandatory Resolution Proof", "Municipal officers cannot close a ticket without attaching photographic proof of completed repairs."),
                ("Citizen Verification Sign-Off", "Reporting citizens confirm whether the issue was satisfactorily resolved before final archiving.")
            ]
        }
    ]
    
    for i, feat in enumerate(features):
        fx = xs[i]
        card = add_rect(slide, fx, feat_y, feat_w, feat_h, CARD_BG, CARD_BORDER, border_width=1, rounded=True)
        
        # Badge
        add_pill(slide, fx + Inches(0.18), feat_y + Inches(0.18), Inches(2.3), Inches(0.24), feat["tag"], feat["tag_bg"], feat["tag_color"], font_size=8, bold=True)
        
        # Title
        tb_t = slide.shapes.add_textbox(fx + Inches(0.18), feat_y + Inches(0.48), feat_w - Inches(0.36), Inches(0.32))
        tf_t = tb_t.text_frame
        tf_t.word_wrap = True
        tf_t.margin_left = Inches(0)
        tf_t.margin_top = Inches(0)
        p_t = tf_t.paragraphs[0]
        p_t.text = feat["title"]
        p_t.font.name = FONT_FAMILY
        p_t.font.size = Pt(13)
        p_t.font.bold = True
        p_t.font.color.rgb = TEXT_DARK
        
        # Bullets
        tb_b = slide.shapes.add_textbox(fx + Inches(0.18), feat_y + Inches(0.82), feat_w - Inches(0.36), feat_h - Inches(0.9))
        tf_b = tb_b.text_frame
        tf_b.word_wrap = True
        tf_b.margin_left = Inches(0)
        tf_b.margin_top = Inches(0)
        
        for idx_b, (head, body) in enumerate(feat["bullets"]):
            p = tf_b.paragraphs[0] if idx_b == 0 else tf_b.add_paragraph()
            p.space_before = Pt(5) if idx_b > 0 else Pt(0)
            
            # Bullet text run
            run_head = p.add_run()
            run_head.text = f"• {head}: "
            run_head.font.name = FONT_FAMILY
            run_head.font.size = Pt(8.8)
            run_head.font.bold = True
            run_head.font.color.rgb = TEXT_DARK
            
            run_body = p.add_run()
            run_body.text = body
            run_body.font.name = FONT_FAMILY
            run_body.font.size = Pt(8.4)
            run_body.font.color.rgb = TEXT_MUTED_DARK

# ---------------------------------------------------------------------------
# SLIDE 4 BUILDER — CITIZEN EXPERIENCE (REAL SCREENSHOTS)
# ---------------------------------------------------------------------------
def build_slide_4(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide, LIGHT_BG)
    
    # Header
    add_header(slide, "LIVE SYSTEM DEMONSTRATION  •  CITIZEN PORTAL", "Actual Website: Citizen Experience", "Frictionless civic participation: photo lodgment, AI analysis, and real-time status tracking.")
    
    # 3 Screenshots from Developed Website
    screen_cards = [
        {
            "img": "01_homepage.png",
            "title": "01 | Public Homepage & Awareness",
            "caption": "Public landing page displaying civic purpose, live resolution stats, and quick-access issue lodgment."
        },
        {
            "img": "02_report_issue.png",
            "title": "02 | GPS Lodgment & AI Analysis",
            "caption": "Evidence upload box, Gemini AI suggestion preview, and interactive OpenStreetMap coordinate picker."
        },
        {
            "img": "07_report_detail.png",
            "title": "03 | AI Details & Resolution Proof",
            "caption": "Live report CL-2026-00003: Gemini AI structured analysis, progression timeline, and official resolution photo proof."
        }
    ]
    
    card_w = Inches(3.75)
    card_h = Inches(3.35)
    card_y = Inches(1.45)
    xs = [Inches(0.8), Inches(4.79), Inches(8.78)]
    
    for i, s_info in enumerate(screen_cards):
        add_screenshot_frame(slide, xs[i], card_y, card_w, card_h, s_info["img"], s_info["title"], s_info["caption"])
        
    # Bottom Section: 4 Citizen Journey Milestones
    flow_y = Inches(4.95)
    flow_h = Inches(2.10)
    flow_w = Inches(2.78)
    flow_gap = Inches(0.20)
    
    milestones = [
        ("STAGE 01", "Fast Onboarding", "Citizens register or log in with phone/email credentials, maintaining an organized record of all submitted municipal reports."),
        ("STAGE 02", "Visual & Spatial Pinning", "Citizens capture clear on-site photographs and mark exact GPS coordinates via OpenStreetMap to eliminate ambiguous addresses."),
        ("STAGE 03", "Multimodal AI Triage", "Gemini AI analyzes the image and description, suggests category and department, and flags urgent public hazards automatically."),
        ("STAGE 04", "Verified Lifecycle Closure", "Citizens receive real-time notifications as status changes, review municipal resolution photo proof, and confirm closure.")
    ]
    
    for i, (tag, title, body) in enumerate(milestones):
        mx = Inches(0.8) + i * (flow_w + flow_gap)
        m_card = add_rect(slide, mx, flow_y, flow_w, flow_h, CARD_BG, CARD_BORDER, border_width=1, rounded=True)
        
        # Pill
        add_pill(slide, mx + Inches(0.12), flow_y + Inches(0.12), Inches(1.0), Inches(0.22), tag, BADGE_BLUE_BG, ACCENT_BLUE, font_size=8, bold=True)
        
        # Text
        tb = slide.shapes.add_textbox(mx + Inches(0.12), flow_y + Inches(0.38), flow_w - Inches(0.24), flow_h - Inches(0.44))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0)
        tf.margin_top = Inches(0)
        
        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.name = FONT_FAMILY
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = TEXT_DARK
        
        p2 = tf.add_paragraph()
        p2.text = body
        p2.font.name = FONT_FAMILY
        p2.font.size = Pt(8.5)
        p2.font.color.rgb = TEXT_MUTED_DARK
        p2.space_before = Pt(4)

# ---------------------------------------------------------------------------
# SLIDE 5 BUILDER — MUNICIPAL AUTHORITY EXPERIENCE (REAL SCREENSHOTS)
# ---------------------------------------------------------------------------
def build_slide_5(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide, LIGHT_BG)
    
    # Header
    add_header(slide, "LIVE SYSTEM DEMONSTRATION  •  MUNICIPAL CONSOLE", "Actual Website: Municipal Authority Experience", "Restricted command center: caseload triage, inter-agency assignment, and spatial analytics.")
    
    # 3 Screenshots from Developed Website
    screen_cards = [
        {
            "img": "04_authority_dashboard.png",
            "title": "01 | Municipal Caseload Console",
            "caption": "Live KPI counters (Pending, Assigned, In Progress, Resolved) and administrative table with direct action triggers."
        },
        {
            "img": "03_community_map.png",
            "title": "02 | Karachi Geospatial Incident Map",
            "caption": "Interactive OpenStreetMap layer displaying localized civic complaints across Karachi with severity-coded pins."
        },
        {
            "img": "05_analytics.png",
            "title": "03 | Resolution Analytics & SLA KPIs",
            "caption": "Recharts-driven intelligence: complaint distribution by category, status share, and response velocity trends."
        }
    ]
    
    card_w = Inches(3.75)
    card_h = Inches(3.35)
    card_y = Inches(1.45)
    xs = [Inches(0.8), Inches(4.79), Inches(8.78)]
    
    for i, s_info in enumerate(screen_cards):
        add_screenshot_frame(slide, xs[i], card_y, card_w, card_h, s_info["img"], s_info["title"], s_info["caption"])
        
    # Bottom Section: 4 Core Authority Capabilities
    cap_y = Inches(4.95)
    cap_h = Inches(2.10)
    cap_w = Inches(2.78)
    cap_gap = Inches(0.20)
    
    capabilities = [
        ("SECURITY & RBAC", "Controlled Official Access", "Authority access is strictly restricted to authorized municipal officers via authenticated credentials; no open public registration."),
        ("TRIAGE & ROUTING", "Cross-Agency Routing", "Officers inspect incoming complaints, confirm AI category suggestions, and route directly to SSWMB, KW&SC, KMC, or SEPA."),
        ("LIFECYCLE OPS", "Operational Progression", "Update complaint status from Pending → Assigned → In Progress, logging internal field engineering notes and assignment timestamps."),
        ("PROOF OF CLOSURE", "Mandatory Evidence Upload", "Officers cannot mark an issue resolved without uploading photographic proof of completed repairs for citizen and supervisory audit.")
    ]
    
    for i, (tag, title, body) in enumerate(capabilities):
        cx = Inches(0.8) + i * (cap_w + cap_gap)
        c_card = add_rect(slide, cx, cap_y, cap_w, cap_h, CARD_BG, CARD_BORDER, border_width=1, rounded=True)
        
        # Pill
        add_pill(slide, cx + Inches(0.12), cap_y + Inches(0.12), Inches(1.4), Inches(0.22), tag, BADGE_EMERALD_BG, RGBColor(5, 150, 105), font_size=7.5, bold=True)
        
        # Text
        tb = slide.shapes.add_textbox(cx + Inches(0.12), cap_y + Inches(0.38), cap_w - Inches(0.24), cap_h - Inches(0.44))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0)
        tf.margin_top = Inches(0)
        
        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.name = FONT_FAMILY
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = TEXT_DARK
        
        p2 = tf.add_paragraph()
        p2.text = body
        p2.font.name = FONT_FAMILY
        p2.font.size = Pt(8.5)
        p2.font.color.rgb = TEXT_MUTED_DARK
        p2.space_before = Pt(4)

# ---------------------------------------------------------------------------
# SLIDE 6 BUILDER — IMPACT, FUTURE VISION & THANK YOU
# ---------------------------------------------------------------------------
def build_slide_6(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_slide_background(slide, NAVY_BG)
    
    # Header
    add_header(slide, "MUNICIPAL VALUE & STRATEGIC ROADMAP", "Impact, Future Vision & Conclusion", "Building data-driven, accountable, and responsive urban governance for sustainable cities.", is_dark=True)
    
    card_y = Inches(1.45)
    card_h = Inches(3.55)
    card_w = Inches(5.75)
    
    # Left Card: Measurable Municipal Value
    left_card = add_rect(slide, Inches(0.8), card_y, card_w, card_h, NAVY_CARD, NAVY_BORDER, border_width=1, rounded=True)
    add_pill(slide, Inches(1.0), card_y + Inches(0.18), Inches(2.6), Inches(0.25), "TANGIBLE MUNICIPAL IMPACT", BADGE_DARK_BLUE, TEXT_LIGHT_CYAN, font_size=8.5, bold=True)
    
    tb_left = slide.shapes.add_textbox(Inches(1.0), card_y + Inches(0.50), card_w - Inches(0.4), card_h - Inches(0.6))
    tf_l = tb_left.text_frame
    tf_l.word_wrap = True
    tf_l.margin_left = Inches(0)
    tf_l.margin_top = Inches(0)
    
    impact_points = [
        ("Accelerated Issue Turnaround", "Automated AI classification and direct departmental routing reduce complaint latency by over 60%, eliminating manual paper handoffs."),
        ("Elimination of Ghost Resolutions", "Mandatory before/after photographic proof and citizen verification ensure field contractors deliver verified work."),
        ("Targeted Capital Allocation", "Geospatial clustering and analytics reveal chronic infrastructure breakdown zones, directing municipal budgets to root causes."),
        ("Restored Civic Trust", "Transparent, verifiable tracking bridges the historical trust gap between citizens and urban municipal authorities.")
    ]
    
    for idx, (title, desc) in enumerate(impact_points):
        p = tf_l.paragraphs[0] if idx == 0 else tf_l.add_paragraph()
        p.space_before = Pt(7) if idx > 0 else Pt(0)
        
        run_t = p.add_run()
        run_t.text = f"✔ {title}: "
        run_t.font.name = FONT_FAMILY
        run_t.font.size = Pt(9.5)
        run_t.font.bold = True
        run_t.font.color.rgb = TEXT_LIGHT_CYAN
        
        run_d = p.add_run()
        run_d.text = desc
        run_d.font.name = FONT_FAMILY
        run_d.font.size = Pt(8.8)
        run_d.font.color.rgb = RGBColor(226, 232, 240)
        
    # Right Card: Strategic Future Roadmap
    right_card = add_rect(slide, Inches(6.78), card_y, card_w, card_h, NAVY_CARD, NAVY_BORDER, border_width=1, rounded=True)
    add_pill(slide, Inches(7.0), card_y + Inches(0.18), Inches(2.6), Inches(0.25), "STRATEGIC FUTURE ROADMAP", BADGE_DARK_EMERALD, TEXT_LIGHT_EMERALD, font_size=8.5, bold=True)
    
    tb_right = slide.shapes.add_textbox(Inches(7.0), card_y + Inches(0.50), card_w - Inches(0.4), card_h - Inches(0.6))
    tf_r = tb_right.text_frame
    tf_r.word_wrap = True
    tf_r.margin_left = Inches(0)
    tf_r.margin_top = Inches(0)
    
    roadmap_points = [
        ("Authorized Government Integration", "Direct API gateways to integrate seamlessly with Sindh Local Government, KMC Central Control, and 1122 dispatch."),
        ("City-Wide & Provincial Scaling", "Phased deployment across all 7 districts of Karachi, followed by regional expansion to Hyderabad, Sukkur, and Larkana."),
        ("Urdu & Sindhi Language Localization", "Complete RTL interface with multilingual voice-to-text AI analysis for grassroots citizen accessibility."),
        ("IoT & Automated Sensor Feeds", "Automated ingestion of smart stormwater level gauges, pipeline pressure telemetry, and WhatsApp bot complaint channels.")
    ]
    
    for idx, (title, desc) in enumerate(roadmap_points):
        p = tf_r.paragraphs[0] if idx == 0 else tf_r.add_paragraph()
        p.space_before = Pt(7) if idx > 0 else Pt(0)
        
        run_t = p.add_run()
        run_t.text = f"★ {title}: "
        run_t.font.name = FONT_FAMILY
        run_t.font.size = Pt(9.5)
        run_t.font.bold = True
        run_t.font.color.rgb = TEXT_LIGHT_EMERALD
        
        run_d = p.add_run()
        run_d.text = desc
        run_d.font.name = FONT_FAMILY
        run_d.font.size = Pt(8.8)
        run_d.font.color.rgb = RGBColor(226, 232, 240)
        
    # Bottom Closing Hero Banner
    banner_y = Inches(5.15)
    banner_h = Inches(1.85)
    banner_w = Inches(11.73)
    
    banner = add_rect(slide, Inches(0.8), banner_y, banner_w, banner_h, NAVY_CARD_DEEP, NAVY_BORDER_ACC, border_width=1.5, rounded=True)
    
    tb_banner = slide.shapes.add_textbox(Inches(1.0), banner_y + Inches(0.12), banner_w - Inches(0.4), banner_h - Inches(0.2))
    tf_b = tb_banner.text_frame
    tf_b.word_wrap = True
    tf_b.margin_left = Inches(0)
    tf_b.margin_top = Inches(0)
    
    # Closing Quote
    p_q = tf_b.paragraphs[0]
    p_q.text = '"Better Cities Begin with Better Communication."'
    p_q.font.name = FONT_FAMILY
    p_q.font.size = Pt(17)
    p_q.font.bold = True
    p_q.font.italic = True
    p_q.font.color.rgb = ACCENT_GOLD
    p_q.alignment = PP_ALIGN.CENTER
    
    # Product Name & Tagline
    p_brand = tf_b.add_paragraph()
    p_brand.text = "CIVICLENS AI   •   Report. Route. Resolve."
    p_brand.font.name = FONT_FAMILY
    p_brand.font.size = Pt(14)
    p_brand.font.bold = True
    p_brand.font.color.rgb = TEXT_WHITE
    p_brand.alignment = PP_ALIGN.CENTER
    p_brand.space_before = Pt(3)
    
    # Presenters Line
    p_pres = tf_b.add_paragraph()
    p_pres.text = "Presented By:   Pardeep Kumar   |   Vishal Kumar   |   Parkash"
    p_pres.font.name = FONT_FAMILY
    p_pres.font.size = Pt(12)
    p_pres.font.bold = True
    p_pres.font.color.rgb = TEXT_LIGHT_EMERALD
    p_pres.alignment = PP_ALIGN.CENTER
    p_pres.space_before = Pt(4)
    
    # Thank You Note
    p_ty = tf_b.add_paragraph()
    p_ty.text = "Thank You!   •   Open for Municipal Committee Questions & Discussion"
    p_ty.font.name = FONT_FAMILY
    p_ty.font.size = Pt(10.5)
    p_ty.font.color.rgb = TEXT_LIGHT_MUTED
    p_ty.alignment = PP_ALIGN.CENTER
    p_ty.space_before = Pt(3)

# ---------------------------------------------------------------------------
# MAIN PRESENTATION GENERATOR
# ---------------------------------------------------------------------------
def main():
    print("[Presentation] Initializing PowerPoint Presentation...")
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    
    print("[Presentation] Building Slide 1: Introduction...")
    build_slide_1(prs)
    
    print("[Presentation] Building Slide 2: The Problem We Solve...")
    build_slide_2(prs)
    
    print("[Presentation] Building Slide 3: Our Solution: CivicLens AI...")
    build_slide_3(prs)
    
    print("[Presentation] Building Slide 4: Actual Website: Citizen Experience...")
    build_slide_4(prs)
    
    print("[Presentation] Building Slide 5: Actual Website: Municipal Authority Experience...")
    build_slide_5(prs)
    
    print("[Presentation] Building Slide 6: Impact, Future Vision & Thank You...")
    build_slide_6(prs)
    
    print(f"[Presentation] Saving output to {OUTPUT_PPTX}...")
    prs.save(OUTPUT_PPTX)
    print(f"[Presentation] Successfully generated presentation with {len(prs.slides)} slides!")

if __name__ == "__main__":
    main()
