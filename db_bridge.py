from pg       import connect
from datetime import datetime, timezone
from base64   import b64encode, b64decode


###############################################################################
#############################  UTIL QUERY EXECUTE   ###########################

def open_connection(connection_string):
    connection = connect(connection_string)

    connection.prepare("insert_event", """insert into event
        (_nbr_send_event, _data) values ($1, $2)""")

    connection.prepare("get_events", """
    select
        _data,
        _nbr_send_event
        from event
            where _nbr_send_event > $1
        order by _nbr_send_event
        limit 50
    """)
    
    return connection

def query_db (query_name, connection, args = ()):
    result = connection.query_prepared(query_name, args)
    if type(result) == type(""):
        return None
    else:
        return result.getresult()


###############################################################################
###########################  DATABASE QUERY BRIDGES   #########################

def insert_event (data, connection):
    def to_seconds (now_time):
        reference = datetime(2021, 1, 1, 0, 0, 0, 0, timezone.utc)
        return int((now_time - reference) .total_seconds())

    now = to_seconds(datetime.now(timezone.utc))
    b64_data = b64encode(data)

    query_db("insert_event",
        connection,
        args = (now, b64_data)
    )
    return now

def get_from_date (pivot_date, connection):
    db_result = query_db("get_events",
        connection,
        args = (pivot_date,)
    )
    return [ (b64decode(t[0]), t[1]) for t in db_result ]


###############################################################################
####################   MAIN PROCESS IS SETTING UP DATABASE   ##################

if __name__ == '__main__':
    """
create table EVENT (
  _nbr_send_event integer not null,
  _data bytea
)
    """
    from os import environ
    conn = open_connection(environ.get('DATABASE_URL'))

    get_from_date(0, conn)
