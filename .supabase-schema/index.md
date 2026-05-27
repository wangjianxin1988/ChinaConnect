# Database Schema Index

Generated: 2026-05-27T15:37:13.859Z

**30 tables** | **0 views** | **255 functions**

## Tables

| Table | Columns | FKs | Rows | Size |
|-------|---------|-----|------|------|
| [ai_conversations](tables/ai_conversations.md) | 8 | 1 | ~0 | 24 kB |
| [ai_messages](tables/ai_messages.md) | 7 | 1 | ~0 | 24 kB |
| [attractions](tables/attractions.md) | 29 | 1 | ~5 | 136 kB |
| [blogger_restaurants](tables/blogger_restaurants.md) | 17 | 2 | ~0 | 40 kB |
| [bookmarks](tables/bookmarks.md) | 7 | 0 | ~0 | 40 kB |
| [check_ins](tables/check_ins.md) | 12 | 3 | ~0 | 40 kB |
| [cities](tables/cities.md) | 22 | 0 | ~6 | 120 kB |
| [city_images](tables/city_images.md) | 12 | 1 | ~0 | 40 kB |
| [city_metrics](tables/city_metrics.md) | 8 | 1 | ~0 | 32 kB |
| [city_rankings](tables/city_rankings.md) | 14 | 0 | — | — |
| [city_score_history](tables/city_score_history.md) | 10 | 1 | ~0 | 40 kB |
| [city_scores](tables/city_scores.md) | 18 | 1 | ~0 | 48 kB |
| [city_source_data](tables/city_source_data.md) | 9 | 1 | ~0 | 56 kB |
| [community_posts](tables/community_posts.md) | 15 | 1 | ~0 | 72 kB |
| [data_source_configs](tables/data_source_configs.md) | 11 | 0 | ~5 | 64 kB |
| [emergency_info](tables/emergency_info.md) | 18 | 1 | ~4 | 80 kB |
| [geography_columns](tables/geography_columns.md) | 7 | 0 | — | — |
| [geometry_columns](tables/geometry_columns.md) | 7 | 0 | — | — |
| [itineraries](tables/itineraries.md) | 20 | 0 | ~0 | 48 kB |
| [itinerary_days](tables/itinerary_days.md) | 13 | 2 | ~0 | 32 kB |
| [notifications](tables/notifications.md) | 8 | 0 | ~0 | 32 kB |
| [post_comments](tables/post_comments.md) | 8 | 2 | ~0 | 32 kB |
| [post_likes](tables/post_likes.md) | 4 | 1 | ~0 | 32 kB |
| [price_references](tables/price_references.md) | 15 | 1 | ~0 | 32 kB |
| [profiles](tables/profiles.md) | 12 | 0 | ~0 | 32 kB |
| [restaurants](tables/restaurants.md) | 29 | 1 | ~3 | 144 kB |
| [scam_reports](tables/scam_reports.md) | 17 | 1 | ~0 | 48 kB |
| [score_update_logs](tables/score_update_logs.md) | 9 | 0 | ~0 | 24 kB |
| [spatial_ref_sys](tables/spatial_ref_sys.md) | 5 | 0 | ~8,500 | 7144 kB |
| [user_follows](tables/user_follows.md) | 4 | 0 | ~0 | 32 kB |

## Functions

- `_postgis_deprecate`
- `_postgis_index_extent`
- `_postgis_pgsql_version`
- `_postgis_scripts_pgsql_version`
- `_postgis_selectivity`
- `_postgis_stats`
- `_st_3ddfullywithin`
- `_st_3ddwithin`
- `_st_3dintersects`
- `_st_contains`
- `_st_containsproperly`
- `_st_coveredby`
- `_st_covers`
- `_st_crosses`
- `_st_dfullywithin`
- `_st_dwithin`
- `_st_equals`
- `_st_intersects`
- `_st_linecrossingdirection`
- `_st_longestline`
- `_st_maxdistance`
- `_st_orderingequals`
- `_st_overlaps`
- `_st_sortablehash`
- `_st_touches`
- `_st_voronoi`
- `_st_within`
- `addauth`
- `addgeometrycolumn`
- `calculate_city_tier`
- `disablelongtransactions`
- `dropgeometrycolumn`
- `dropgeometrytable`
- `enablelongtransactions`
- `equals`
- `geography`
- `geometry`
- `geometry_above`
- `geometry_below`
- `geometry_cmp`
- `geometry_contained_3d`
- `geometry_contains`
- `geometry_contains_3d`
- `geometry_distance_box`
- `geometry_distance_centroid`
- `geometry_eq`
- `geometry_ge`
- `geometry_gist_same_2d`
- `geometry_gt`
- `geometry_le`
- `geometry_left`
- `geometry_lt`
- `geometry_overabove`
- `geometry_overbelow`
- `geometry_overlaps`
- `geometry_overlaps_3d`
- `geometry_overleft`
- `geometry_overright`
- `geometry_right`
- `geometry_same`
- `geometry_same_3d`
- `geometry_within`
- `geomfromewkb`
- `geomfromewkt`
- `gettransactionid`
- `longtransactionsenabled`
- `populate_geometry_columns`
- `postgis_constraint_dims`
- `postgis_constraint_srid`
- `postgis_constraint_type`
- `postgis_extensions_upgrade`
- `postgis_full_version`
- `postgis_geos_version`
- `postgis_lib_build_date`
- `postgis_lib_revision`
- `postgis_lib_version`
- `postgis_libjson_version`
- `postgis_liblwgeom_version`
- `postgis_libprotobuf_version`
- `postgis_libxml_version`
- `postgis_proj_version`
- `postgis_scripts_build_date`
- `postgis_scripts_installed`
- `postgis_scripts_released`
- `postgis_svn_version`
- `postgis_transform_geometry`
- `postgis_type_name`
- `postgis_version`
- `postgis_wagyu_version`
- `st_3dclosestpoint`
- `st_3ddfullywithin`
- `st_3ddistance`
- `st_3ddwithin`
- `st_3dintersects`
- `st_3dlongestline`
- `st_3dmakebox`
- `st_3dmaxdistance`
- `st_3dshortestline`
- `st_addpoint`
- `st_angle`
- `st_area`
- `st_asencodedpolyline`
- `st_asewkt`
- `st_asgeojson`
- `st_asgml`
- `st_askml`
- `st_aslatlontext`
- `st_asmarc21`
- `st_asmvtgeom`
- `st_assvg`
- `st_astext`
- `st_astwkb`
- `st_asx3d`
- `st_azimuth`
- `st_boundingdiagonal`
- `st_buffer`
- `st_centroid`
- `st_clipbybox2d`
- `st_closestpoint`
- `st_collect`
- `st_concavehull`
- `st_contains`
- `st_containsproperly`
- `st_coorddim`
- `st_coveredby`
- `st_covers`
- `st_crosses`
- `st_curvetoline`
- `st_delaunaytriangles`
- `st_dfullywithin`
- `st_difference`
- `st_disjoint`
- `st_distance`
- `st_distancesphere`
- `st_distancespheroid`
- `st_dwithin`
- `st_equals`
- `st_expand`
- `st_force3d`
- `st_force3dm`
- `st_force3dz`
- `st_force4d`
- `st_forcesfs`
- `st_frechetdistance`
- `st_generatepoints`
- `st_geogfromtext`
- `st_geogfromwkb`
- `st_geographyfromtext`
- `st_geohash`
- `st_geomcollfromtext`
- `st_geomcollfromwkb`
- `st_geometricmedian`
- `st_geometryfromtext`
- `st_geomfromewkb`
- `st_geomfromewkt`
- `st_geomfromgeojson`
- `st_geomfromgml`
- `st_geomfromkml`
- `st_geomfrommarc21`
- `st_geomfromtext`
- `st_geomfromtwkb`
- `st_geomfromwkb`
- `st_gmltosql`
- `st_hasarc`
- `st_hausdorffdistance`
- `st_hexagon`
- `st_hexagongrid`
- `st_interpolatepoint`
- `st_intersection`
- `st_intersects`
- `st_isvaliddetail`
- `st_length`
- `st_letters`
- `st_linecrossingdirection`
- `st_linefromencodedpolyline`
- `st_linefromtext`
- `st_linefromwkb`
- `st_lineinterpolatepoints`
- `st_linelocatepoint`
- `st_linestringfromwkb`
- `st_linetocurve`
- `st_locatealong`
- `st_locatebetween`
- `st_locatebetweenelevations`
- `st_longestline`
- `st_makebox2d`
- `st_makeline`
- `st_makevalid`
- `st_maxdistance`
- `st_maximuminscribedcircle`
- `st_minimumboundingcircle`
- `st_minimumboundingradius`
- `st_mlinefromtext`
- `st_mlinefromwkb`
- `st_mpointfromtext`
- `st_mpointfromwkb`
- `st_mpolyfromtext`
- `st_mpolyfromwkb`
- `st_multilinefromwkb`
- `st_multilinestringfromtext`
- `st_multipointfromtext`
- `st_multipointfromwkb`
- `st_multipolyfromwkb`
- `st_multipolygonfromtext`
- `st_node`
- `st_normalize`
- `st_offsetcurve`
- `st_orderingequals`
- `st_overlaps`
- `st_perimeter`
- `st_point`
- `st_pointfromtext`
- `st_pointfromwkb`
- `st_pointm`
- `st_pointz`
- `st_pointzm`
- `st_polyfromtext`
- `st_polyfromwkb`
- `st_polygonfromtext`
- `st_polygonfromwkb`
- `st_project`
- `st_quantizecoordinates`
- `st_reduceprecision`
- `st_relate`
- `st_removerepeatedpoints`
- `st_scale`
- `st_segmentize`
- `st_setsrid`
- `st_sharedpaths`
- `st_shortestline`
- `st_simplifypolygonhull`
- `st_snap`
- `st_snaptogrid`
- `st_split`
- `st_square`
- `st_squaregrid`
- `st_srid`
- `st_subdivide`
- `st_swapordinates`
- `st_symdifference`
- `st_symmetricdifference`
- `st_tileenvelope`
- `st_touches`
- `st_transform`
- `st_triangulatepolygon`
- `st_unaryunion`
- `st_union`
- `st_voronoilines`
- `st_voronoipolygons`
- `st_within`
- `st_wkbtosql`
- `st_wkttosql`
- `st_wrapx`
- `unlockrows`
- `updategeometrysrid`