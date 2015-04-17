<?php

include "config.php";

/*
 * For all functions $dbh is a database connection
 */

/*
 * @return handle to database connection
 */
function db_connect($host, $port, $db, $user, $pw) {
	$dbconn = pg_connect("host=$host port=$port dbname=$db user=$user password=$pw")
	or die('Could not connect: ' . pg_last_error());
	return $dbconn;
}

/*
 * Close database connection
 */
function close_db_connection($dbh) {
	if (!$dbh) {
		echo "Postgres cannot be disconnected.\n";
	} else {
		pg_close($dbh);
	}
}

/*
 * Login if user and password match
 * Return associative array of the form:
 * array(
 *		'status' =>  (1 for success and 0 for failure)
 *		'userID' => '[USER ID]'
 * )
 */
function login($dbh, $user, $pw) {
	if (!$dbh) {
		echo "Postgres cannot be connected.\n";
		return array('status' => 0, 'userID' => NULL);
	} else {
		$the_user=pg_escape_string($user);
		if (strlen($the_user) < 2 || strlen($the_user) > 50) {
			return array('status' => 0, 'userID' => NULL);
		}
		$the_pw=pg_escape_string($pw);

		$result=pg_query($dbh, "SELECT user_name FROM CMU_User
			WHERE user_name='$the_user' AND user_pw='$the_pw'");
		$row=pg_fetch_row($result);

		if(!$result || $row==NULL) {
			return array('status' => 0, 'userID' => NULL);
		} else {
			return array('status' => 1, 'userID' => $the_user);
		}
	}
}

/*
 * Register user with given password
 * Return associative array of the form:
 * array(
 *		'status' =>   (1 for success and 0 for failure)
 *		'userID' => '[USER ID]'
 * )
 */
function register($dbh, $user, $pw) {
	if (!$dbh) {
		echo "Postgres cannot be connected.\n";
		return array('status' => 0, 'userID' => NULL);
	} else {
		$the_user=pg_escape_string($user);
		if (strlen($the_user) < 2 || strlen($the_user) > 50) {
			return array('status' => 0, 'userID' => NULL);
		}
		$the_pw=pg_escape_string($pw);

		$result=pg_query($dbh, "INSERT INTO CMU_User(user_name, user_pw) VALUES ('$the_user', '$the_pw')");


		if(!$result) {
			return array('status' => 0, 'userID' => NULL);
		} else {
			return array('status' => 1, 'userID' => $the_user);
		}
	}
}

/*
 * Register user with given password
 * Return associative array of the form:
 * array(
 *		'status' =>   (1 for success and 0 for failure)
 * )
 */
function post_post($dbh, $title, $msg, $me) {
	if (!$dbh) {
		echo "Postgres cannot be connected.\n";
		return array('status' => 0);
	} else {
		$the_title=pg_escape_string($title);
		$the_msg=pg_escape_string($msg);
		$the_me=pg_escape_string($me);

		$result=pg_query($dbh, "INSERT INTO CMU_Post(post_id, post_user_name, post_title, post_body, post_timestamp)
				VALUES (default, '$the_me', '$the_title', '$the_msg', LOCALTIMESTAMP(0))");

		if(!$result) {
			return array('status' => 0);
		} else {
			return array('status' => 1);
		}
	}
}


/*
 * Get timeline of $count most recent posts that were written before timestamp $start
 * For a user $user, the timeline should include all posts.
 * Order by time of the post (going backward in time), and break ties by sorting by the username alphabetically
 * Return associative array of the form:
 * array(
 *		'status' => (1 for success and 0 for failure)
 *		'posts' => [ (Array of post objects) ]
 * )
 * Each post should be of the form:
 * array(
 *		'pID' => (INTEGER)
 *		'username' => (USERNAME)
 *		'title' => (TITLE OF POST)
 *    'content' => (CONTENT OF POST)
 *		'time' => (UNIXTIME INTEGER)
 * )
 */
function get_timeline($dbh, $user, $count = 10, $start = PHP_INT_MAX) {
	if (!$dbh) {
		echo "Postgres cannot be connected.\n";
	} else {
		$the_user = pg_escape_string($user);
		$query = <<<EOF

		SELECT *
		FROM CMU_Post
		WHERE post_timestamp < to_timestamp('$start')
		ORDER BY post_timestamp DESC
		LIMIT $count;

EOF;
		$result = pg_query($dbh, $query);

		if (!$result) {
			return array('status' => 0,
						 'posts' => NULL);
		} else {
			$posts = array();
			while ($row = pg_fetch_row($result)) {
				$databean = array('pID' => $row[0],
								'username' => $row[1],
								'title' => $row[2],
								'content' => $row[3],
								'time' => strtotime($row[4]));
				$posts[] = $databean;
			}

			return array('status' => 1,
						 'posts' => $posts);
		}
	}
}

/*
 * Get list of $count most recent posts that were written by user $user before timestamp $start
 * Order by time of the post (going backward in time)
 * Return associative array of the form:
 * array(
 *		'status' =>   (1 for success and 0 for failure)
 *		'posts' => [ (Array of post objects) ]
 * )
 * Each post should be of the form:
 * array(
 *		'pID' => (INTEGER)
 *		'username' => (USERNAME)
 *		'title' => (TITLE)
 *		'content' => (CONTENT)
 *		'time' => (UNIXTIME INTEGER)
 * )
 */
function get_user_posts($dbh, $user, $count = 10, $start = PHP_INT_MAX) {
	if (!$dbh) {
		echo "Postgres cannot be connected.\n";
	} else {
		$the_user = pg_escape_string($user);
		$query = <<<EOF

		SELECT *
		FROM CMU_Post
		WHERE post_timestamp < to_timestamp('$start') AND post_user_name = '$the_user'
		ORDER BY post_timestamp DESC
		LIMIT $count;

EOF;
		$result = pg_query($dbh, $query);

		if (!$result) {
			return array('status' => 0,
						 'posts' => NULL);
		} else {
			$posts = array();
			while ($row = pg_fetch_row($result)) {
				$databean = array('pID' => $row[0],
								'username' => $row[1],
								'title' => $row[2],
								'content' => $row[3],
								'time' => strtotime($row[4]));
				$posts[] = $databean;
			}

			return array('status' => 1,
						 'posts' => $posts);
		}
	}
}

/*
 * Deletes a post given $user name and $pID.
 * $user must be the one who posted the post $pID.
 * Return associative array of the form:
 * array(
 *		'status' =>   (1 for success. 0 or 2 for failure)
 * )
 */
function delete_post($dbh, $user, $pID) {
	if (!$dbh) {
		echo "Postgres cannot be connected.\n";
		return array('status' => 0);
	} else {
		$the_user=pg_escape_string($user);
		$the_pID=pg_escape_string($pID);

		$result=pg_query($dbh, "DELETE FROM CMU_Post WHERE post_user_name='$the_user' AND post_id='$the_pID';");

		if(!$result) {
			return array('status' => 0);
		} else {
			return array('status' => 1);
		}
	}
}

/*
 * Records a "like" for a post given logged-in user $me and $pID.
 * Return associative array of the form:
 * array(
 *		'status' =>   (1 for success. 0 for failure)
 * )
 */
function like_post($dbh, $me, $pID) {
	if (!$dbh) {
		echo "Postgres cannot be connected.\n";
		return array('status' => 0);
	} else {
		$the_me=pg_escape_string($me);
		$the_pID=pg_escape_string($pID);

		$query = "SELECT post_user_name FROM CMU_Post WHERE post_id=$the_pID";
		$preResult = pg_query($dbh, $query);
		if ($preResult && $row = pg_fetch_row($preResult)) {
			if ($row[0] == $me) {
				return array('status' => 0);
			}
		}

		$result=pg_query($dbh, "INSERT INTO CMU_Like(like_user_name, like_id)
			VALUES ('$the_me', $the_pID);");

		if(!$result) {
			return array('status' => 0);
		} else {
			return array('status' => 1);
		}
	}
}

/*
 * Check if $me has already liked post $pID
 * Return true if user $me has liked post $pID or false otherwise
 */
function already_liked($dbh, $me, $pID) {
	if (!$dbh) {
		echo "Postgres cannot be connected.\n";
	} else {
		$the_me=pg_escape_string($me);
		$the_pID=pg_escape_string($pID);

		$result=pg_query($dbh, "SELECT * FROM CMU_Like WHERE like_user_name='$the_me'
			 AND like_id=$the_pID;");

		if(!$result || pg_num_rows($result) == 0) {
			return false;
		} else {
			return true;
		}
	}
}

/*
 * Find the $count most recent posts that contain the string $key
 * Order by time of the post and break ties by the username (sorted alphabetically A-Z)
 * Return associative array of the form:
 * array(
 *		'status' =>   (1 for success and 0 for failure)
 *		'posts' => [ (Array of Post objects) ]
 * )
 */
function search($dbh, $key, $count = 50) {
	if (!$dbh) {
		echo "Postgres cannot be connected.\n";
	} else {
		$the_key = pg_escape_string($key);
		$query = <<<EOF

		SELECT * FROM CMU_Post
		WHERE post_body LIKE '%$the_key%' OR post_title LIKE '%$the_key%'
		ORDER BY post_timestamp DESC, post_user_name ASC
		LIMIT $count;

EOF;
		$result = pg_query($dbh, $query);

		if (!$result) {
			return array('status' => 0,
						 'posts' => NULL);
		} else {
			$posts = array();
			while ($row = pg_fetch_row($result)) {
				$databean = array('pID' => $row[0],
								'username' => $row[1],
								'title' => $row[2],
								'content' => $row[3],
								'time' => strtotime($row[4]));
				$posts[] = $databean;
			}

			return array('status' => 1,
						 'posts' => $posts);
		}
	}
}

/*
 * Find all users whose username includes the string $name
 * Sort the users alphabetically (A-Z)
 * Return associative array of the form:
 * array(
 *		'status' =>   (1 for success and 0 for failure)
 *		'users' => [ (Array of user IDs) ]
 * )
 */
function user_search($dbh, $name) {
	if (!$dbh) {
		echo "Postgres cannot be connected.\n";
	} else {
		$the_name=pg_escape_string($name);
        $query = "SELECT * FROM CMU_User WHERE user_name LIKE '%$the_name%'
                        ORDER BY user_name ASC;";
        $result=pg_query($dbh, $query);
		if (!$result) {
			return array('status' => 0, 'users' => NULL);
		} else {
			$record=array();
			while($row=pg_fetch_row($result)) {
				$record[]=$row[0];
			}
			return array('status' => 1, 'users' => $record);
		}
	}
}


/*
 * Get the number of likes of post $pID
 * Return associative array of the form:
 * array(
 *		'status' =>   (1 for success and 0 for failure)
 *		'count' => (The number of likes)
 * )
 */
function get_num_likes($dbh, $pID) {
	if (!$dbh) {
		echo "Postgres cannot be connected.\n";
	} else {
		$the_pID=pg_escape_string($pID);

		$result=pg_query($dbh, "SELECT count(*) FROM CMU_Like WHERE like_id=$the_pID;");

		if(!$result) {
			return array('status' => 0,
						'count' => 0);
		} else {
			$row = pg_fetch_row($result);
			return array('status' => 1,
						'count' => $row[0]);
		}
	}
}

/*
 * Get the number of posts of user $uID
 * Return associative array of the form:
 * array(
 *		'status' =>   (1 for success and 0 for failure)
 *		'count' => (The number of posts)
 * )
 */
function get_num_posts($dbh, $uID) {
	if (!$dbh) {
		echo "Postgres cannot be connected.\n";
	} else {
		$the_uID=pg_escape_string($uID);

		$result=pg_query($dbh, "SELECT count(*) FROM CMU_Post WHERE post_user_name='$the_uID';");


		if(!$result) {
			return array('status' => 0,
						'count' => 0);
		} else {
			$row = pg_fetch_row($result);
			return array('status' => 1,
						'count' => $row[0]);
		}
	}
}

/*
 * Get the number of likes user $uID made
 * Return associative array of the form:
 * array(
 *		'status' =>   (1 for success and 0 for failure)
 *		'count' => (The number of likes)
 * )
 */
function get_num_likes_of_user($dbh, $uID) {
	if (!$dbh) {
		echo "Postgres cannot be connected.\n";
	} else {
		$the_uID=pg_escape_string($uID);

		$result=pg_query($dbh, "SELECT count(*) FROM CMU_Like WHERE like_user_name='$the_uID';");


		if(!$result) {
			return array('status' => 0,
						'count' => 0);
		} else {
			$row = pg_fetch_row($result);
			return array('status' => 1,
						'count' => $row[0]);
		}
	}
}

/*
 * Get the list of $count users that have posted the most
 * Order by the number of posts (descending), and then by username (A-Z)
 * Return associative array of the form:
 * array(
 *		'status' =>   (1 for success and 0 for failure)
 *		'users' => [ (Array of user IDs) ]
 * )
 */
function get_most_active_users($dbh, $count = 10) {
	if (!$dbh) {
		echo "Postgres cannot be connected.\n";
	} else {

		$result=pg_query($dbh, "SELECT post_user_name FROM CMU_Post GROUP BY post_user_name
			 ORDER BY COUNT(*) DESC, post_user_name ASC LIMIT $count;");
		if (!$result) {
			return array('status' => 0, 'users' => NULL);
		} else {
			$record=array();
			while($row=pg_fetch_row($result)) {
				$record[]=$row[0];
			}

			return array('status' => 1, 'users' => $record);
		}
	}
}

/*
 * Get the list of $count posts posted after $from that have the most likes.
 * Order by the number of likes (descending)
 * Return associative array of the form:
 * array(
 *		'status' =>   (1 for success and 0 for failure)
 *		'posts' => [ (Array of post objects) ]
 * )
 * Each post should be of the form:
 * array(
 *		'pID' => (INTEGER)
 *		'username' => (USERNAME)
 *		'title' => (TITLE OF POST)
 *    'content' => (CONTENT OF POST)
 *		'time' => (UNIXTIME INTEGER)
 * )
 */
function get_most_popular_posts($dbh, $count = 10, $from = 0) {
	if (!$dbh) {
		echo "Postgres cannot be connected.\n";
	} else {
		$query = <<<EOF

		select p.post_id, p.post_user_name, p.post_title, p.post_body, p.post_timestamp
		from CMU_Post as p inner join CMU_like as l on p.post_id=l.like_id
		where p.post_timestamp > to_timestamp('$from')
		group by p.post_id, p.post_user_name, p.post_title, p.post_body, p.post_timestamp
		order by count(*) desc
		limit $count;

EOF;
		$result = pg_query($dbh, $query);

		if (!$result) {
			return array('status' => 0,
						 'posts' => NULL);
		} else {
			$posts = array();
			while ($row = pg_fetch_row($result)) {
				$databean = array('pID' => $row[0],
								'username' => $row[1],
								'title' => $row[2],
								'content' => $row[3],
								'time' => strtotime($row[4]));
				$posts[] = $databean;
			}

			return array('status' => 1,
						 'posts' => $posts);
		}
	}
}

/*
 * Recommend posts for user $user.
 * A post $p is a recommended post for $user if like minded users of $user also like the post,
 * where like minded users are users who like the posts $user likes.
 * Result should not include posts $user liked.
 * Rank the recommended posts by how many like minded users like the posts.
 * The set of like minded users should not include $user self.
 *
 * Return associative array of the form:
 * array(
 *    'status' =>   (1 for success and 0 for failure)
 *    'posts' => [ (Array of post objects) ]
 * )
 * Each post should be of the form:
 * array(
 *		'pID' => (INTEGER)
 *		'username' => (USERNAME)
 *		'title' => (TITLE OF POST)
 *    'content' => (CONTENT OF POST)
 *		'time' => (UNIXTIME INTEGER)
 * )
 */
function get_recommended_posts($dbh, $count = 10, $user) {
	if (!$dbh) {
		echo "Postgres cannot be connected.\n";
	} else {
		$the_user = pg_escape_string($user);
		$query = <<<EOD

		SELECT post_id, post_user_name, post_title, post_body, post_timestamp
		FROM CMU_Post AS p INNER JOIN
		(SELECT like_id FROM CMU_Like WHERE like_user_name IN
			(SELECT DISTINCT l1.like_user_name FROM CMU_Like as l1, CMU_Like as l2 WHERE(l1.like_user_name <>l2.like_user_name
				AND l2.like_user_name='$the_user' AND l2.like_id=l1.like_id))
			AND like_id NOT IN (SELECT like_id FROM CMU_Like WHERE like_user_name='$the_user')) AS h
		ON p.post_id=h.like_id
		GROUP BY post_id, post_user_name, post_title, post_body, post_timestamp
		ORDER BY COUNT(*) DESC
		LIMIT $count;

EOD;
		$result = pg_query($dbh, $query);

		if (!$result) {
			return array('status' => 0,
						 'posts' => NULL);
		} else {
			$posts = array();
			while ($row = pg_fetch_row($result)) {
				$databean = array('pID' => $row[0],
								'username' => $row[1],
								'title' => $row[2],
								'content' => $row[3],
								'time' => strtotime($row[4]));
				$posts[] = $databean;
			}

			return array('status' => 1,
						 'posts' => $posts);
		}
	}

}

/*
 * Delete all tables in the database and then recreate them (without any data)
 * Return associative array of the form:
 * array(
 *		'status' =>   (1 for success and 0 for failure)
 * )
 */
function reset_database($dbh) {
	if (!$dbh) {
		echo "Postgres cannot be connected.\n";
	} else {
		$query = <<<EOD
		DROP TABLE IF EXISTS CMU_User CASCADE;
		DROP TABLE IF EXISTS CMU_Post CASCADE;
		DROP TABLE IF EXISTS CMU_Like CASCADE;
		CREATE TABLE CMU_User(user_name VARCHAR(50), user_pw VARCHAR(50), PRIMARY KEY(user_name));
		CREATE TABLE CMU_Post(post_id SERIAL, post_user_name VARCHAR(50),
			post_title TEXT, post_body TEXT, post_timestamp TIMESTAMP, PRIMARY KEY(post_id),
			FOREIGN KEY(post_user_name) REFERENCES CMU_User(user_name) ON DELETE CASCADE);
		CREATE TABLE CMU_Like (like_user_name CHAR(50), like_id SERIAL,
			PRIMARY KEY(like_user_name, like_id), FOREIGN KEY(like_user_name)
			REFERENCES CMU_User(user_name) ON DELETE CASCADE, FOREIGN KEY(like_id) REFERENCES CMU_Post(post_id) ON DELETE CASCADE);

EOD;
		$result = pg_query($dbh, $query);
		if (!$result) {
			return array('status' => 0);
		} else {
			return array('status' => 1);
		}
	}
}

?>
