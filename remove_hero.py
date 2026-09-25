import codecs

with codecs.open("src/views/student/OpportunitiesView.jsx", "r", "utf-8") as f:
    content = f.read()

# Replace the split logic with just standardOpportunities = liveOpportunities
content = content.replace(
    "const featured = liveOpportunities.length > 0 ? liveOpportunities[0] : null;\n  const standardOpportunities = liveOpportunities.slice(1);",
    "const standardOpportunities = liveOpportunities;"
)

# We need to remove the HERO SECTION block.
# Let's use regex or string manipulation.
start_str = "{/* HERO SECTION */}"
end_str = "{/* GRID SECTION */}"

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    # also remove the '{featured && (' wrapping the hero
    # just slice it out
    content = content[:start_idx] + content[end_idx:]

with codecs.open("src/views/student/OpportunitiesView.jsx", "w", "utf-8") as f:
    f.write(content)
