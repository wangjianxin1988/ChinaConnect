# Database Functions (RPCs)

255 functions

## _postgis_deprecate

**Parameters:**
- `newname`: text
- `oldname`: text
- `version`: text

## _postgis_index_extent

**Parameters:**
- `col`: text
- `tbl`: regclass

## _postgis_pgsql_version

## _postgis_scripts_pgsql_version

## _postgis_selectivity

**Parameters:**
- `att_name`: text
- `geom`: public.geometry
- `mode`: text
- `tbl`: regclass

## _postgis_stats

**Parameters:**
- ``: text
- `att_name`: text
- `tbl`: regclass

## _st_3ddfullywithin

**Parameters:**
- ``: double precision
- `geom1`: public.geometry
- `geom2`: public.geometry

## _st_3ddwithin

**Parameters:**
- ``: double precision
- `geom1`: public.geometry
- `geom2`: public.geometry

## _st_3dintersects

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## _st_contains

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## _st_containsproperly

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## _st_coveredby

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## _st_covers

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## _st_crosses

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## _st_dfullywithin

**Parameters:**
- ``: double precision
- `geom1`: public.geometry
- `geom2`: public.geometry

## _st_dwithin

**Parameters:**
- `geog1`: public.geography
- `geog2`: public.geography
- `tolerance`: double precision
- `use_spheroid`: boolean

## _st_equals

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## _st_intersects

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## _st_linecrossingdirection

**Parameters:**
- `line1`: public.geometry
- `line2`: public.geometry

## _st_longestline

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## _st_maxdistance

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## _st_orderingequals

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## _st_overlaps

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## _st_sortablehash

**Parameters:**
- `geom`: public.geometry

## _st_touches

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## _st_voronoi

**Parameters:**
- `clip`: public.geometry
- `g1`: public.geometry
- `return_polygons`: boolean
- `tolerance`: double precision

## _st_within

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## addauth

**Parameters:**
- ``: text

## addgeometrycolumn

**Parameters:**
- `catalog_name`: character varying
- `column_name`: character varying
- `new_dim`: integer
- `new_srid_in`: integer
- `new_type`: character varying
- `schema_name`: character varying
- `table_name`: character varying
- `use_typmod`: boolean

## calculate_city_tier

**Parameters:**
- `score`: numeric

## disablelongtransactions

## dropgeometrycolumn

**Parameters:**
- `catalog_name`: character varying
- `column_name`: character varying
- `schema_name`: character varying
- `table_name`: character varying

## dropgeometrytable

**Parameters:**
- `catalog_name`: character varying
- `schema_name`: character varying
- `table_name`: character varying

## enablelongtransactions

## equals

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## geography

**Parameters:**
- ``: bytea

## geometry

**Parameters:**
- ``: text

## geometry_above

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## geometry_below

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## geometry_cmp

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## geometry_contained_3d

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## geometry_contains

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## geometry_contains_3d

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## geometry_distance_box

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## geometry_distance_centroid

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## geometry_eq

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## geometry_ge

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## geometry_gist_same_2d

**Parameters:**
- ``: internal
- `geom1`: public.geometry
- `geom2`: public.geometry

## geometry_gt

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## geometry_le

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## geometry_left

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## geometry_lt

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## geometry_overabove

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## geometry_overbelow

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## geometry_overlaps

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## geometry_overlaps_3d

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## geometry_overleft

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## geometry_overright

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## geometry_right

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## geometry_same

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## geometry_same_3d

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## geometry_within

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## geomfromewkb

**Parameters:**
- ``: bytea

## geomfromewkt

**Parameters:**
- ``: text

## gettransactionid

## longtransactionsenabled

## populate_geometry_columns

**Parameters:**
- `tbl_oid`: oid
- `use_typmod`: boolean

## postgis_constraint_dims

**Parameters:**
- `geomcolumn`: text
- `geomschema`: text
- `geomtable`: text

## postgis_constraint_srid

**Parameters:**
- `geomcolumn`: text
- `geomschema`: text
- `geomtable`: text

## postgis_constraint_type

**Parameters:**
- `geomcolumn`: text
- `geomschema`: text
- `geomtable`: text

## postgis_extensions_upgrade

## postgis_full_version

## postgis_geos_version

## postgis_lib_build_date

## postgis_lib_revision

## postgis_lib_version

## postgis_libjson_version

## postgis_liblwgeom_version

## postgis_libprotobuf_version

## postgis_libxml_version

## postgis_proj_version

## postgis_scripts_build_date

## postgis_scripts_installed

## postgis_scripts_released

## postgis_svn_version

## postgis_transform_geometry

**Parameters:**
- ``: integer
- `geom`: public.geometry

## postgis_type_name

**Parameters:**
- `coord_dimension`: integer
- `geomname`: character varying
- `use_new_name`: boolean

## postgis_version

## postgis_wagyu_version

## st_3dclosestpoint

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_3ddfullywithin

**Parameters:**
- ``: double precision
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_3ddistance

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_3ddwithin

**Parameters:**
- ``: double precision
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_3dintersects

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_3dlongestline

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_3dmakebox

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_3dmaxdistance

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_3dshortestline

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_addpoint

**Parameters:**
- ``: integer
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_angle

**Parameters:**
- `pt1`: public.geometry
- `pt2`: public.geometry
- `pt3`: public.geometry
- `pt4`: public.geometry

## st_area

**Parameters:**
- `geog`: public.geography
- `use_spheroid`: boolean

## st_asencodedpolyline

**Parameters:**
- `geom`: public.geometry
- `nprecision`: integer

## st_asewkt

**Parameters:**
- ``: text

## st_asgeojson

**Parameters:**
- `geom_column`: text
- `maxdecimaldigits`: integer
- `pretty_bool`: boolean
- `r`: record

## st_asgml

**Parameters:**
- `geom`: public.geometry
- `id`: text
- `maxdecimaldigits`: integer
- `nprefix`: text
- `options`: integer
- `version`: integer

## st_askml

**Parameters:**
- `geom`: public.geometry
- `maxdecimaldigits`: integer
- `nprefix`: text

## st_aslatlontext

**Parameters:**
- `geom`: public.geometry
- `tmpl`: text

## st_asmarc21

**Parameters:**
- `format`: text
- `geom`: public.geometry

## st_asmvtgeom

**Parameters:**
- `bounds`: public.box2d
- `buffer`: integer
- `clip_geom`: boolean
- `extent`: integer
- `geom`: public.geometry

## st_assvg

**Parameters:**
- `geom`: public.geometry
- `maxdecimaldigits`: integer
- `rel`: integer

## st_astext

**Parameters:**
- ``: text

## st_astwkb

**Parameters:**
- `geom`: public.geometry[]
- `ids`: bigint[]
- `prec`: integer
- `prec_m`: integer
- `prec_z`: integer
- `with_boxes`: boolean
- `with_sizes`: boolean

## st_asx3d

**Parameters:**
- `geom`: public.geometry
- `maxdecimaldigits`: integer
- `options`: integer

## st_azimuth

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_boundingdiagonal

**Parameters:**
- `fits`: boolean
- `geom`: public.geometry

## st_buffer

**Parameters:**
- `geom`: public.geometry
- `quadsegs`: integer
- `radius`: double precision

## st_centroid

**Parameters:**
- ``: public.geography
- `use_spheroid`: boolean

## st_clipbybox2d

**Parameters:**
- `box`: public.box2d
- `geom`: public.geometry

## st_closestpoint

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_collect

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_concavehull

**Parameters:**
- `param_allow_holes`: boolean
- `param_geom`: public.geometry
- `param_pctconvex`: double precision

## st_contains

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_containsproperly

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_coorddim

**Parameters:**
- `geometry`: public.geometry

## st_coveredby

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_covers

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_crosses

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_curvetoline

**Parameters:**
- `flags`: integer
- `geom`: public.geometry
- `tol`: double precision
- `toltype`: integer

## st_delaunaytriangles

**Parameters:**
- `flags`: integer
- `g1`: public.geometry
- `tolerance`: double precision

## st_dfullywithin

**Parameters:**
- ``: double precision
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_difference

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry
- `gridsize`: double precision

## st_disjoint

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_distance

**Parameters:**
- `geog1`: public.geography
- `geog2`: public.geography
- `use_spheroid`: boolean

## st_distancesphere

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry
- `radius`: double precision

## st_distancespheroid

**Parameters:**
- ``: public.spheroid
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_dwithin

**Parameters:**
- `geog1`: public.geography
- `geog2`: public.geography
- `tolerance`: double precision
- `use_spheroid`: boolean

## st_equals

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_expand

**Parameters:**
- `dm`: double precision
- `dx`: double precision
- `dy`: double precision
- `dz`: double precision
- `geom`: public.geometry

## st_force3d

**Parameters:**
- `geom`: public.geometry
- `zvalue`: double precision

## st_force3dm

**Parameters:**
- `geom`: public.geometry
- `mvalue`: double precision

## st_force3dz

**Parameters:**
- `geom`: public.geometry
- `zvalue`: double precision

## st_force4d

**Parameters:**
- `geom`: public.geometry
- `mvalue`: double precision
- `zvalue`: double precision

## st_forcesfs

**Parameters:**
- ``: public.geometry
- `version`: text

## st_frechetdistance

**Parameters:**
- ``: double precision
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_generatepoints

**Parameters:**
- `area`: public.geometry
- `npoints`: integer
- `seed`: integer

## st_geogfromtext

**Parameters:**
- ``: text

## st_geogfromwkb

**Parameters:**
- ``: bytea

## st_geographyfromtext

**Parameters:**
- ``: text

## st_geohash

**Parameters:**
- `geom`: public.geometry
- `maxchars`: integer

## st_geomcollfromtext

**Parameters:**
- ``: text

## st_geomcollfromwkb

**Parameters:**
- ``: bytea

## st_geometricmedian

**Parameters:**
- `fail_if_not_converged`: boolean
- `g`: public.geometry
- `max_iter`: integer
- `tolerance`: double precision

## st_geometryfromtext

**Parameters:**
- ``: text

## st_geomfromewkb

**Parameters:**
- ``: bytea

## st_geomfromewkt

**Parameters:**
- ``: text

## st_geomfromgeojson

**Parameters:**
- ``: text

## st_geomfromgml

**Parameters:**
- ``: text

## st_geomfromkml

**Parameters:**
- ``: text

## st_geomfrommarc21

**Parameters:**
- `marc21xml`: text

## st_geomfromtext

**Parameters:**
- ``: text

## st_geomfromtwkb

**Parameters:**
- ``: bytea

## st_geomfromwkb

**Parameters:**
- ``: bytea

## st_gmltosql

**Parameters:**
- ``: text

## st_hasarc

**Parameters:**
- `geometry`: public.geometry

## st_hausdorffdistance

**Parameters:**
- ``: double precision
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_hexagon

**Parameters:**
- `cell_i`: integer
- `cell_j`: integer
- `origin`: public.geometry
- `size`: double precision

## st_hexagongrid

**Parameters:**
- `bounds`: public.geometry
- `size`: double precision

## st_interpolatepoint

**Parameters:**
- `line`: public.geometry
- `point`: public.geometry

## st_intersection

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry
- `gridsize`: double precision

## st_intersects

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_isvaliddetail

**Parameters:**
- `flags`: integer
- `geom`: public.geometry

## st_length

**Parameters:**
- `geog`: public.geography
- `use_spheroid`: boolean

## st_letters

**Parameters:**
- `font`: json
- `letters`: text

## st_linecrossingdirection

**Parameters:**
- `line1`: public.geometry
- `line2`: public.geometry

## st_linefromencodedpolyline

**Parameters:**
- `nprecision`: integer
- `txtin`: text

## st_linefromtext

**Parameters:**
- ``: text

## st_linefromwkb

**Parameters:**
- ``: bytea

## st_lineinterpolatepoints

**Parameters:**
- ``: double precision
- `repeat`: boolean

## st_linelocatepoint

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_linestringfromwkb

**Parameters:**
- ``: bytea

## st_linetocurve

**Parameters:**
- `geometry`: public.geometry

## st_locatealong

**Parameters:**
- `geometry`: public.geometry
- `leftrightoffset`: double precision
- `measure`: double precision

## st_locatebetween

**Parameters:**
- `frommeasure`: double precision
- `geometry`: public.geometry
- `leftrightoffset`: double precision
- `tomeasure`: double precision

## st_locatebetweenelevations

**Parameters:**
- `fromelevation`: double precision
- `geometry`: public.geometry
- `toelevation`: double precision

## st_longestline

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_makebox2d

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_makeline

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_makevalid

**Parameters:**
- `geom`: public.geometry
- `params`: text

## st_maxdistance

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_maximuminscribedcircle

**Parameters:**
- ``: public.geometry

## st_minimumboundingcircle

**Parameters:**
- `inputgeom`: public.geometry
- `segs_per_quarter`: integer

## st_minimumboundingradius

**Parameters:**
- ``: public.geometry

## st_mlinefromtext

**Parameters:**
- ``: text

## st_mlinefromwkb

**Parameters:**
- ``: bytea

## st_mpointfromtext

**Parameters:**
- ``: text

## st_mpointfromwkb

**Parameters:**
- ``: bytea

## st_mpolyfromtext

**Parameters:**
- ``: text

## st_mpolyfromwkb

**Parameters:**
- ``: bytea

## st_multilinefromwkb

**Parameters:**
- ``: bytea

## st_multilinestringfromtext

**Parameters:**
- ``: text

## st_multipointfromtext

**Parameters:**
- ``: text

## st_multipointfromwkb

**Parameters:**
- ``: bytea

## st_multipolyfromwkb

**Parameters:**
- ``: bytea

## st_multipolygonfromtext

**Parameters:**
- ``: text

## st_node

**Parameters:**
- `g`: public.geometry

## st_normalize

**Parameters:**
- `geom`: public.geometry

## st_offsetcurve

**Parameters:**
- `distance`: double precision
- `line`: public.geometry
- `params`: text

## st_orderingequals

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_overlaps

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_perimeter

**Parameters:**
- `geog`: public.geography
- `use_spheroid`: boolean

## st_point

**Parameters:**
- ``: double precision
- `srid`: integer

## st_pointfromtext

**Parameters:**
- ``: text

## st_pointfromwkb

**Parameters:**
- ``: bytea

## st_pointm

**Parameters:**
- `mcoordinate`: double precision
- `srid`: integer
- `xcoordinate`: double precision
- `ycoordinate`: double precision

## st_pointz

**Parameters:**
- `srid`: integer
- `xcoordinate`: double precision
- `ycoordinate`: double precision
- `zcoordinate`: double precision

## st_pointzm

**Parameters:**
- `mcoordinate`: double precision
- `srid`: integer
- `xcoordinate`: double precision
- `ycoordinate`: double precision
- `zcoordinate`: double precision

## st_polyfromtext

**Parameters:**
- ``: text

## st_polyfromwkb

**Parameters:**
- ``: bytea

## st_polygonfromtext

**Parameters:**
- ``: text

## st_polygonfromwkb

**Parameters:**
- ``: bytea

## st_project

**Parameters:**
- `azimuth`: double precision
- `distance`: double precision
- `geog`: public.geography

## st_quantizecoordinates

**Parameters:**
- `g`: public.geometry
- `prec_m`: integer
- `prec_x`: integer
- `prec_y`: integer
- `prec_z`: integer

## st_reduceprecision

**Parameters:**
- `geom`: public.geometry
- `gridsize`: double precision

## st_relate

**Parameters:**
- ``: text
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_removerepeatedpoints

**Parameters:**
- `geom`: public.geometry
- `tolerance`: double precision

## st_scale

**Parameters:**
- ``: public.geometry
- `origin`: public.geometry

## st_segmentize

**Parameters:**
- `geog`: public.geography
- `max_segment_length`: double precision

## st_setsrid

**Parameters:**
- `geom`: public.geometry
- `srid`: integer

## st_sharedpaths

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_shortestline

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_simplifypolygonhull

**Parameters:**
- `geom`: public.geometry
- `is_outer`: boolean
- `vertex_fraction`: double precision

## st_snap

**Parameters:**
- ``: double precision
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_snaptogrid

**Parameters:**
- ``: double precision
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_split

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_square

**Parameters:**
- `cell_i`: integer
- `cell_j`: integer
- `origin`: public.geometry
- `size`: double precision

## st_squaregrid

**Parameters:**
- `bounds`: public.geometry
- `size`: double precision

## st_srid

**Parameters:**
- `geom`: public.geometry

## st_subdivide

**Parameters:**
- `geom`: public.geometry
- `gridsize`: double precision
- `maxvertices`: integer

## st_swapordinates

**Parameters:**
- `geom`: public.geometry
- `ords`: cstring

## st_symdifference

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry
- `gridsize`: double precision

## st_symmetricdifference

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_tileenvelope

**Parameters:**
- `bounds`: public.geometry
- `margin`: double precision
- `x`: integer
- `y`: integer
- `zoom`: integer

## st_touches

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_transform

**Parameters:**
- `from_proj`: text
- `geom`: public.geometry
- `to_srid`: integer

## st_triangulatepolygon

**Parameters:**
- `g1`: public.geometry

## st_unaryunion

**Parameters:**
- ``: public.geometry
- `gridsize`: double precision

## st_union

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry
- `gridsize`: double precision

## st_voronoilines

**Parameters:**
- `extend_to`: public.geometry
- `g1`: public.geometry
- `tolerance`: double precision

## st_voronoipolygons

**Parameters:**
- `extend_to`: public.geometry
- `g1`: public.geometry
- `tolerance`: double precision

## st_within

**Parameters:**
- `geom1`: public.geometry
- `geom2`: public.geometry

## st_wkbtosql

**Parameters:**
- `wkb`: bytea

## st_wkttosql

**Parameters:**
- ``: text

## st_wrapx

**Parameters:**
- `geom`: public.geometry
- `move`: double precision
- `wrap`: double precision

## unlockrows

**Parameters:**
- ``: text

## updategeometrysrid

**Parameters:**
- `catalogn_name`: character varying
- `column_name`: character varying
- `new_srid_in`: integer
- `schema_name`: character varying
- `table_name`: character varying
