from pg       import connect
from datetime import datetime, timezone


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

    query_db("insert_event",
        connection,
        args = (now, data)
    )
    return now

def get_from_date (pivot_date, connection):
    return query_db("get_events",
        connection,
        args = (pivot_date,)
    )


###############################################################################
####################   MAIN PROCESS IS SETTING UP DATABASE   ##################

if __name__ == '__main__':
#    conn = open_connection(FILL ME WITH CONFIG)

    query_db("""
    create table EVENT (
        _nbr_send_event integer not null,
        _data bytea
    )
    """, conn)
